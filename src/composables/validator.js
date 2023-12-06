import { reactive, watch } from "vue";

class Validator {
    /**
     * Constructor.
     * 
     * @param {Object} data Target data for validation.
     * @param {Object} rules Validation rules for each property.
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
        return messages[0] || '';
    }

    /**
     * Watch targets for execute validation rules.
     */
    watchTargets() {
        Object.entries(this.rules).forEach(([key, rule]) => {
            watch(() => this.dataGet(this.data, key), (value) => {
                if (key in this.errors) delete this.errors[key];
                const messages = this.validate(key, value, rule);
                if (messages.length) this.errors[key] = messages;
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
            if (messages.length) this.errors[key] = messages;
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
                const ruleName = typeof rule === 'object' ? rule.name : rule;
                const msgKey = key + '.' + ruleName;

                if (msgKey in messages) {
                    messages[msgKey] = this.customMessage(messages[msgKey]);
                } else {
                    const handler = defaultMessages[ruleName];
                    
                    if (typeof handler === 'function') {
                        const params = typeof rule === 'object' ? rule.params : [];
                        messages[msgKey] = handler(this.attributes[key], ...params);
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
        return this.messages[key + '.' + rule] || '';
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
            max: (attr, max) => `The ${attr} must not be greater than ${max}.`,
            between: (attr, min, max) => `The ${attr} must be between ${min} and ${max}.`,
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
        let $message = String(message).replace(':attr', attr);

        Object.keys(params).forEach(p => {
            $message = $message.replace(':' + p, params[p]);
        });

        return $message;
    }
}

/**
 * Constructor.
 * 
 * @param {Object} data Target data for validation.
 * @param {Object} rules Validation rules for each property.
 * @param {Object} messages Custom validation messages.
 * @param {Object} attributes Custom attributes names.
 */
export function useValidator(data = {}, rules = {}, messages = {}, attributes = {}) {
    return new Validator(data, rules, messages, attributes);
}

export default Validator;