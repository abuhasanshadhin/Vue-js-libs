import { reactive, watch } from "vue";

class Validator {
    /**
     * Constructor.
     * 
     * @param {Object} data Target data for validation.
     * @param {Object} rules Validation Rules for each property.
     * @param {Object} messages Custom validation messages.
     * @param {Object} attributes Custom attributes names.
     */
    constructor(data = {}, rules = {}, messages = {}, attributes = {}) {
        this.data = data;
        this.rules = this.parseRules(rules);
        this.attributes = this.prepareAttributes(attributes);
        this.messages = this.prepareMessages(messages);
        this.validators = this.prepareValidators();
        this.errors = reactive({});
        this.watchTargets();
    }

    /**
     * Count errors.
     * 
     * @returns Number
     */
    countErrors() {
        return Object.values(this.errors).flat().length;
    }

    /**
     * Determine if validation passed.
     * 
     * @returns Boolean
     */
    passes() {
        return this.countErrors() === 0;
    }

    /**
     * Determine if validation failed.
     * 
     * @returns Boolean
     */
    fails() {
        return !this.passes();
    }

    /**
     * Get errors bag.
     * 
     * @param {String|null} key
     * @returns Object
     */
    getErrors(key = null) {
        return key ? this.errors[key] : this.errors;
    }

    /**
     * Get error message bag.
     * 
     * @returns Array
     */
    getMessageBag() {
        return Object.values(this.errors).flat();
    }

    /**
     * Check error exists.
     * 
     * @param {String} key
     * @returns Boolean
     */
    hasError(key) {
        return Boolean(this.errors[key]);
    }

    /**
     * Get first error from errors bag.
     * 
     * @param {String} key
     * @returns ?String
     */
    firstError(key) {
        const messages = this.errors[key] || [];
        return messages[0] || null;
    }

    /**
     * Watch targets for execute validation rules.
     */
    watchTargets() {
        Object.entries(this.rules).forEach(([key, rule]) => {
            watch(() => this.dataGet(this.data, key), (value) => {
                if (key in this.errors) delete this.errors[key];
                const messages = this.validate(key, value, rule);
                if (messages.length > 0) this.errors[key] = messages;
            });
        });
    }

    /**
     * Execute validation manually.
     */
    execute() {
        Object.entries(this.rules).forEach(([key, rule]) => {
            if (key in this.errors) delete this.errors[key];
            const value = this.dataGet(this.data, key);
            const messages = this.validate(key, value, rule);
            if (messages.length > 0) this.errors[key] = messages;
        });

        return this;
    }

    /**
     * Validate target field by given rules.
     * 
     * @param {String} key
     * @param {*} value
     * @param {Array} rules
     * @returns Array
     */
    validate(key, value, rules) {
        const messages = [];

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];

            if (rule === 'nullable') {
                if (this.dataGet(this.data, key)) continue;
                else break;
            }

            if (typeof rule === 'string') {
                if (!(rule in this.validators)) return;
                const validator = this.validators[rule];
                if (typeof validator !== 'function') return;
                const message = validator(key, value);
                messages.push(message);
            } else if (typeof rule === 'function') {
                const message = rule(value, key);
                messages.push(message);
            } else if (typeof rule === 'object') {
                if (!(rule.name in this.validators)) return;
                const validator = this.validators[rule.name];
                if (typeof validator !== 'function') return;
                const message = validator(key, value, ...rule.params);
                messages.push(message);
            }
        }

        return messages.filter(Boolean);
    }

    /**
     * Parse validation rules from template.
     * 
     * @param {Object} rules
     * @returns Object
     */
    parseRules(rules) {
        const $rules = {};

        Object.entries(rules).forEach(([key, value]) => {
            if (typeof value === 'string') {
                $rules[key] = [];
                const pipeRules = value.split('|');
                pipeRules.forEach((name, i) => {
                    if (name.includes(':')) {
                        const [n, args] = name.split(':');
                        const params = args.split(',');
                        $rules[key][i] = { name: n, params };
                    } else {
                        $rules[key][i] = name;
                    }
                });
            } else if (Array.isArray(value)) {
                $rules[key] = value;
            }
        });

        return Object.freeze($rules);
    }

    /**
     * Get data from target object.
     * 
     * @param {Object} target
     * @param {String} key
     * @returns ?String
     */
    dataGet(target, key) {
        return String(key).split('.').reduce((prev, curr) => {
            if (typeof prev === 'object') return prev[curr];
        }, target);
    }

    /**
     * Prepare formatted attributes.
     * 
     * @param {Object} attributes 
     * @returns Object
     */
    prepareAttributes(attributes) {
        Object.keys(this.rules).forEach(key => {
            if (key in attributes) return;
            attributes[key] = String(key)
                .split('.')
                .at(-1)
                .replace(/([_-])|(?=[A-Z])/g, ' ')
                .toLowerCase()
                .trim();
        });

        return attributes;
    }

    /**
     * Prepare messages.
     * 
     * @param {Object} messages 
     * @returns Object
     */
    prepareMessages(messages) {
        const defaultMessages = this.getDefaultMessages();

        Object.entries(this.rules).forEach(([key, rules]) => {
            rules.forEach(rule => {
                if (typeof rule === 'string') {
                    const mk = key + '.' + rule;
                    if (mk in messages) {
                        messages[mk] = this.customMessage(messages[mk]);
                    } else {
                        const handler = defaultMessages[rule];
                        if (typeof handler === 'function') {
                            messages[mk] = handler(this.attributes[key]);
                        }
                    }
                } else if (typeof rule === 'object') {
                    const mk = key + '.' + rule.name;
                    if (mk in messages) {
                        messages[mk] = this.customMessage(messages[mk]);
                    } else {
                        const attr = this.attributes[key];
                        const value = this.dataGet(this.data, key);
                        const handler = defaultMessages[rule.name];
                        if (typeof handler !== 'object') return;
                        if (typeof value === 'string' && typeof handler.string === 'function') {
                            messages[mk] = handler.string(attr, ...rule.params);
                        } else if (typeof value === 'number' && typeof handler.number === 'function') {
                            messages[mk] = handler.number(attr, ...rule.params);
                        } else if (Array.isArray(value) && typeof handler.array === 'function') {
                            messages[mk] = handler.array(attr, ...rule.params);
                        }
                    }
                }
            });
        });

        return messages;
    }

    /**
     * Prepare validators.
     * 
     * @returns Object
     */
    prepareValidators() {
        return Object.freeze({
            required: (key, value) => {
                if (!value) return this.getMessage(key, 'required');
            },
            email: (key, value) => {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!(regex.test(value))) return this.getMessage(key, 'email');
            },
            max: (key, value, max) => {
                const number = typeof value === 'number' && value > max;
                const string = typeof value === 'string' && value.length > max;
                const array = Array.isArray(value) && value.length > max;
                if (number || string || array) return this.getMessage(key, 'max');
            },
            between: (key, value, min, max) => {
                const number = typeof value === 'number' && (value < min || value > max);
                const string = typeof value === 'string' && (value.length < min || value.length > max);
                const array = Array.isArray(value) && (value.length < min || value.length > max);
                if (number || string || array) return this.getMessage(key, 'between');
            },
            numeric: (key, value) => {
                if (typeof value !== 'number') return this.getMessage(key, 'numeric');
            },
        });
    }

    /**
     * Get message from messages.
     * 
     * @param {String} key 
     * @param {String} rule 
     * @returns ?String
     */
    getMessage(key, rule) {
        return this.messages[key + '.' + rule] || null;
    }

    /**
     * Get default messages.
     * 
     * @returns Object
     */
    getDefaultMessages() {
        return Object.freeze({
            required: (attr) => `The ${attr} field is required.`,
            email: (attr) => `The ${attr} must be a valid email address.`,
            max: {
                number: (attr) => `The ${attr} must be a valid email address.`,
                string: (attr, max) => `The ${attr} must not be greater than ${max} characters.`,
                array: (attr, max) => `The ${attr} must not have more than ${max} items.`,
            },
            between: {
                number: (attr, min, max) => `The ${attr} must be between ${min} and ${max}.`,
                string: (attr, min, max) => `The ${attr} must be between ${min} and ${max} characters.`,
                array: (attr, min, max) => `The ${attr} must have between ${min} and ${max} items.`,
            },
            numeric: (attr) => `The ${attr} must be a number.`,
        });
    }

    /**
     * Get custom message.
     * 
     * @param {String} message 
     * @param {String} attr
     * @param {Object} params 
     * @returns String
     */
    customMessage(message, attr, params = {}) {
        let $m = String(message).replace(':attr', attr);
        Object.keys(params).forEach(p => ($m = $m.replace(':' + p, params[p])));
        return $m;
    }
}

export default Validator;