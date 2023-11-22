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
        this.messages = messages;
        this.rules = this.parseRules(rules);
        this.attributes = this.getAttributes(attributes);
        this.validators = this.getValidators();
        this.errors = reactive({});
        this.watchTargets();
    }

    /**
     * Determine if validation passed.
     * 
     * @returns Boolean
     */
    passes() {
        const errors = Object.values(this.errors).flat();
        return errors.length === 0;
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
     * @returns Object
     */
    getErrors() {
        return this.errors;
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
        const messages = this.errors[key] || null;

        if (Array.isArray(messages) && messages.length > 0) {
            return messages.at(0);
        } else if (typeof messages === 'string') {
            return messages;
        }
    }

    /**
     * Watch targets for execute validation rules.
     */
    watchTargets() {
        Object.entries(this.rules).forEach(([key, vRule]) => {
            watch(() => this.dataGet(this.data, key), (value) => {
                if (key in this.errors) delete this.errors[key];
                const messages = this.validate(key, value, vRule);
                if (messages) this.errors[key] = messages;
            });
        });
    }

    /**
     * Execute validator manually.
     */
    execute() {
        Object.entries(this.rules).forEach(([key, vRule]) => {
            if (key in this.errors) delete this.errors[key];
            const value = this.dataGet(this.data, key);
            const messages = this.validate(key, value, vRule);
            if (messages) this.errors[key] = messages;
        });
    }

    /**
     * Validate target field by given rules.
     * 
     * @param {String} key
     * @param {*} value
     * @param {Object} rules
     * @returns Array
     */
    validate(key, value, rules) {
        const messages = [];

        for (let i = 0; i < rules.length; i++) {
            const rule = rules[i];

            if (typeof rule === 'string') {
                if (!(rule in this.validators)) return;
                const validator = this.validators[rule];
                const message = validator(key, value);
                messages.push(message);
            } else if (typeof rule === 'function') {
                const message = rule(value, key);
                messages.push(message);
            } else if (typeof rule === 'object') {
                if (!(rule.name in this.validators)) return;
                const validator = this.validators[rule.name];
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
        const vRules = {};

        Object.entries(rules).forEach(([key, value]) => {
            if (typeof value === 'string') {
                vRules[key] = [];
                const pipeRules = value.split('|');
                pipeRules.forEach((name, i) => {
                    if (name.includes(':')) {
                        const [n, args] = name.split(':');
                        const params = args.split(',');
                        vRules[key][i] = { name: n, params };
                    } else {
                        vRules[key][i] = name;
                    }
                });
            } else if (Array.isArray(value)) {
                vRules[key] = value;
            }
        });

        return Object.freeze(vRules);
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
     * Get formatted attributes.
     * 
     * @param {Object} attributes 
     * @returns Object
     */
    getAttributes(attributes) {
        const attrs = {};

        Object.keys(this.rules).forEach(key => {
            if (!(key in attributes)) {
                attrs[key] = String(key)
                    .split('.')
                    .at(-1)
                    .replace(/([_-])|(?=[A-Z])/g, ' ')
                    .toLowerCase()
                    .trim();
            }
        });

        return attrs;
    }

    /**
     * Get validators.
     * 
     * @returns Object
     */
    getValidators() {
        return Object.freeze({
            required: (key, value) => {
                if (!value) {
                    return this.vMsg(key, 'The :attr field is required.', 'required');
                }
            },
            email: (key, value) => {
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!(regex.test(value))) {
                    return this.vMsg(key, 'The :attr must be a valid email address.', 'email');
                }
            },
            max: (key, value, max) => {
                if (typeof value === 'number') {
                    if (value > max) {
                        return this.vMsg(key, 'The :attr must not be greater than :max.', { max });
                    }
                } else if (typeof value === 'string') {
                    if (value.length > max) {
                        return this.vMsg(key, 'The :attr must not be greater than :max characters.', { max });
                    }
                } else if (Array.isArray(value)) {
                    if (value.length > max) {
                        return this.vMsg(key, 'The :attr must not have more than :max items.', { max });
                    }
                }
            },
            between: (key, value, min, max) => {
                if (typeof value === 'number') {
                    if (value < min || value > max) {
                        return this.vMsg(key, 'The :attr must be between :min and :max.', 'between', { min, max });
                    }
                } else if (typeof value === 'string') {
                    if (value.length < min || value.length > max) {
                        return this.vMsg(key, 'The :attr must be between :min and :max characters.', 'between', { min, max });
                    }
                } else if (Array.isArray(value)) {
                    if (value.length > length) {
                        return this.vMsg(key, 'The :attr must have between :min and :max items.', 'between', { min, max });
                    }
                }
            },
            numeric: (key, value) => {
                if (typeof value !== 'number') {
                    return this.vMsg(key, 'The :attr must be a number.', 'numeric');
                }
            },
        });
    }

    /**
     * Get formatted validation message.
     * 
     * @param {String} key 
     * @param {String} message 
     * @param {String} rule 
     * @param {Object} attrs 
     * @returns String
     */
    vMsg(key, message, rule, attrs = {}) {
        let msg = this.messages[key + '.' + rule] || message;
        msg = String(msg).replace(/(:attr)/, this.attributes[key]);

        Object.keys(attrs).forEach(attr => {
            const regex = new RegExp('(:' + attr + ')');
            msg = msg.replace(regex, attrs[attr]);
        });

        return msg;
    }
}

export default Validator;