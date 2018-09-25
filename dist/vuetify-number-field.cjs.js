'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

require('vuetify/src/stylus/components/_inputs.styl');
require('vuetify/src/stylus/components/_text-fields.styl');
var Colorable = _interopDefault(require('vuetify/es5/mixins/colorable'));
var Input = _interopDefault(require('vuetify/es5/components/VInput'));

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

var defaultThousandsSeparator;
var defaultDecimalSeparator;

if (Intl && Intl.NumberFormat) {
  // https://caniuse.com/#feat=internationalization
  var template = new Intl.NumberFormat().format(1234.56);
  defaultThousandsSeparator = template.charAt(1);
  defaultDecimalSeparator = template.charAt(template.length - 3);
} else {
  defaultThousandsSeparator = ',';
  defaultDecimalSeparator = '.';
} // console.log('options example', example, 'thousandsSeparator', thousandsSeparator, 'decimalSeparator', decimalSeparator)


var defaults = {
  prefix: '',
  suffix: '',
  thousandsSeparator: defaultThousandsSeparator,
  decimalSeparator: defaultDecimalSeparator,
  decimalLimit: 2,
  integerLimit: 3
};

var VNumberField = {
  name: 'v-number-field',
  mixins: [Colorable, Input],
  inheritAttrs: false,
  data: function data() {
    return {
      initialValue: null,
      internalChange: false,
      badInput: false
    };
  },
  props: {
    autofocus: Boolean,
    box: Boolean,
    clearable: Boolean,
    clearValue: {
      type: Number,
      default: null
    },
    color: {
      type: String,
      default: 'primary'
    },
    fullWidth: Boolean,
    placeholder: String,
    prefix: {
      type: String,
      default: function _default() {
        return defaults.prefix;
      }
    },
    suffix: {
      type: String,
      default: function _default() {
        return defaults.suffix;
      }
    },
    decimalSeparator: {
      type: String,
      default: function _default() {
        return defaults.decimalSeparator;
      }
    },
    thousandsSeparator: {
      type: String,
      default: function _default() {
        return defaults.thousandsSeparator;
      }
    },
    integerLimit: {
      type: Number,
      default: function _default() {
        return defaults.integerLimit;
      }
    },
    decimalLimit: {
      type: Number,
      default: function _default() {
        return defaults.decimalLimit;
      }
    }
  },
  computed: {
    classes: function classes() {
      var classes = {
        'input-group--text-field': true,
        'input-group--text-field-box': this.box,
        'input-group--full-width': this.fullWidth,
        'input-group--prefix': this.prefix,
        'input-group--suffix': this.suffix
      };

      if (this.hasError) {
        classes['error--text'] = true;
      } else {
        return this.addTextColorClassChecks(classes);
      }

      return classes;
    },
    inputValue: {
      get: function get() {
        return this.lazyValue;
      },
      set: function set(val) {
        // console.log('inputValue set val', val)
        this.lazyValue = val;
        this.$emit('input', this.lazyValue);
      }
    },
    isDirty: function isDirty() {
      return this.lazyValue != null && this.lazyValue.toString().length > 0 || this.badInput;
    }
  },
  watch: {
    isFocused: function isFocused(val) {
      // console.log('watch isFocused val', val)
      if (val) {
        this.initialValue = this.lazyValue;
      } else {
        if (this.initialValue !== this.lazyValue) {
          this.$emit('change', this.lazyValue);
        }
      }
    },
    value: {
      handler: function handler(newValue) {
        var _this = this;

        // console.log('watch value newValue', newValue)
        if (this.internalChange) {
          // console.log('watch value internal change')
          this.lazyValue = newValue;
          this.internalChange = false;
        } else {
          // console.log('watch value external change')
          var parsed = this._parse('watch value', newValue); // console.log('watch value parsed', JSON.stringify(parsed))


          var cleaned = parsed.cleaned;
          this.lazyValue = cleaned; // Emit when the externally set value was modified internally

          if (String(newValue) !== this.lazyValue) {
            // console.log('watch value changed')
            this.$nextTick(function () {
              _this.$refs.input.value = cleaned;

              _this.$emit('input', _this.lazyValue);
            });
          } else {// console.log('watch value unchanged')
          }
        }

        if (!this.validateOnBlur) {
          this.validate();
        }
      }
    }
  },
  mounted: function mounted() {
    // console.log('mounted')
    if (this.autofocus) {
      this.focus();
    }
  },
  methods: {
    regexEscape: function regexEscape(value) {
      // Per https://stackoverflow.com/a/3561711/252308
      return value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    },
    // eslint-disable-next-line max-statements
    _parse: function _parse(caller, value) {
      // console.log('_parser caller', caller, 'value', value)
      value = value === null || value === undefined ? '' : value.toString().trim();
      var original = value;
      var _this$$props = this.$props,
          integerLimit = _this$$props.integerLimit,
          decimalLimit = _this$$props.decimalLimit,
          thousandsSeparator = _this$$props.thousandsSeparator,
          decimalSeparator = _this$$props.decimalSeparator;
      var escapedDecimalSeparator = this.regexEscape(decimalSeparator);
      var regexpNonNumericCharacters;

      if (integerLimit > 3) {
        var escapedThousandsSeparator = this.regexEscape(thousandsSeparator);
        var regexpDuplicateThousandsSeparator = new RegExp(escapedThousandsSeparator + escapedThousandsSeparator + '+', 'g'); // console.log('_clean regexpDuplicateThousandsSeparator', regexpDuplicateThousandsSeparator)

        value = value.replace(regexpDuplicateThousandsSeparator, thousandsSeparator); // console.log('_clean value', value)

        regexpNonNumericCharacters = new RegExp('[^0-9' + escapedThousandsSeparator + escapedDecimalSeparator + ']', 'g');
      } else {
        regexpNonNumericCharacters = new RegExp('[^0-9' + escapedDecimalSeparator + ']', 'g');
      } // console.log('_clean regexpNonNumericCharacters', regexpNonNumericCharacters)


      var regexpDuplicateDecimalSeparator = new RegExp(escapedDecimalSeparator + escapedDecimalSeparator + '+', 'g'); // console.log('_clean regexpDuplicateDecimalSeparator', regexpDuplicateDecimalSeparator)

      value = value.replace(regexpNonNumericCharacters, ''); // console.log('_clean value', value)

      value = value.replace(regexpDuplicateDecimalSeparator, decimalSeparator); // console.log('_clean value', value)

      var parts = value.split(decimalSeparator); // console.log('_clean parts', parts)

      var integerPart = parts[0];
      var integerLength = integerPart.length;
      var cleaned = integerPart;
      var decimalPart = '';
      var containsDecimal;

      if (parts.length > 1) {
        containsDecimal = true;
        cleaned += decimalSeparator;

        for (var i = 1; i < parts.length; i++) {
          var part = parts[i];

          if (part.length) {
            decimalPart += part;
          }
        }

        cleaned += decimalPart;
      } else {
        containsDecimal = false;
      } // console.log('_parse cleaned', cleaned)


      var decimalLength = decimalPart.length;
      return {
        original: original,
        cleaned: cleaned,
        integerLimit: integerLimit,
        decimalLimit: decimalLimit,
        thousandsSeparator: thousandsSeparator,
        decimalSeparator: decimalSeparator,
        integerPart: integerPart,
        integerLength: integerLength,
        containsDecimal: containsDecimal,
        decimalPart: decimalPart,
        decimalLength: decimalLength
      };
    },
    cancelEvent: function cancelEvent(e, value) {
      var _this2 = this;

      // console.warn('cancelEvent value', value)
      if (value !== undefined) {
        this.$nextTick(function () {
          _this2.$refs.input.value = value;
        });
      }

      e.preventDefault();
    },
    onInput: function onInput(e) {
      // console.log('onInput e', e)
      var target = e.target;
      var targetValue = target.value;
      var key = e.data; // console.log('onInput e.data', key, 'e.target.value', targetValue)

      var selectionStart = target.selectionStart; // let selectionEnd = target.selectionEnd
      // console.log('onInput selectionStart', selectionStart, 'selectionEnd', selectionEnd)
      // console.log('onInput this.value', this.value, 'this.lazyValue', this.lazyValue, typeof this.lazyValue)

      var valueOld = this.lazyValue; // console.log('onInput valueOld', valueOld)
      // const selection = this.selection
      // console.log('onInput this.selection', selection, 'this.lazySelection', this.lazySelection)

      var parsed = this._parse('onInput', targetValue); // console.log('onInput parsed', JSON.stringify(parsed))


      var valueNew = parsed.cleaned; // console.log('onInput valueNew', valueNew)

      if (valueNew.length) {
        // console.log('onInput A')
        if (parsed.containsDecimal && selectionStart > parsed.integerLength) {
          // console.log('onInput A.A')
          // console.log('onInput decimal part')
          if (parsed.decimalLength > parsed.decimalLimit) {
            // console.log('onInput A.A.A')
            this.cancelEvent(e, valueOld);
            return;
          } else {// console.log('onInput A.A.B')
          }
        } else {
          // console.log('onInput A.B')
          // console.log('onInput integer part')
          if (parsed.integerLength > parsed.integerLimit) {
            // console.log('onInput A.B.A')
            if (key !== parsed.decimalSeparator) {
              // console.log('onInput A.B.A.A')
              this.cancelEvent(e, valueOld);
              return;
            } else {// console.log('onInput A.B.A.B')
            }
          } else {// console.log('onInput A.B.B')
            }
        }
      } else {
        // console.log('onInput B')
        if (parsed.original.length) {
          // console.log('onInput B.A')
          //
          // The new value couldn't be parsed to a number; restore valueOld
          //
          this.cancelEvent(e, valueOld);
          return;
        } else {// console.log('onInput B.B')
        }
      }

      if (valueNew === valueOld) {
        // console.log('onInput unchanged')
        this.cancelEvent(e, valueOld);
        return;
      } else {// console.log('onInput changed')
      }

      this.inputValue = valueNew;
      this.badInput = target.validity && target.validity.badInput;
    },
    blur: function blur(e) {
      var _this3 = this;

      // console.log('blur e', e)
      this.isFocused = false; // Reset internalChange state
      // to allow external change
      // to persist

      this.internalChange = false;
      this.$nextTick(function () {
        _this3.validate();
      });
      this.$emit('blur', e);
    },
    focus: function focus(e) {
      // console.log('focus e', e)
      if (!this.$refs.input) return;
      this.isFocused = true;

      if (document.activeElement !== this.$refs.input) {
        this.$refs.input.focus();
      }

      this.$emit('focus', e);
    },
    keyDown: function keyDown() {
      // console.log('keyDown e', e)
      this.internalChange = true;
    },
    genInput: function genInput() {
      // console.log('genInput')
      var tag = 'input';
      var listeners = Object.assign({}, this.$listeners);
      delete listeners['change']; // Change should not be bound externally

      var value = this._parse('genInput', this.lazyValue).cleaned; // console.log('getInput value', value)


      var data = {
        style: {
          textAlign: 'right'
        },
        domProps: {
          value: value
        },
        attrs: _objectSpread({}, this.$attrs, {
          autofocus: this.autofocus,
          disabled: this.disabled,
          required: this.required,
          readonly: this.readonly,
          tabindex: this.tabindex,
          'aria-label': (!this.$attrs || !this.$attrs.id) && this.label // Label `for` will be set if we have an id

        }),
        on: Object.assign(listeners, {
          blur: this.blur,
          input: this.onInput,
          focus: this.focus,
          keydown: this.keyDown
        }),
        ref: 'input'
      };
      if (this.placeholder) data.attrs.placeholder = this.placeholder;
      data.attrs.type = 'text';
      data.attrs.inputmode = 'decimal';
      var children = [this.$createElement(tag, data)];
      this.prefix && children.unshift(this.genFix('prefix'));
      this.suffix && children.push(this.genFix('suffix'));
      return children;
    },
    genFix: function genFix(type) {
      // console.log('genFix type', type)
      return this.$createElement('span', {
        'class': "input-group--text-field__".concat(type)
      }, this[type]);
    },
    clearableCallback: function clearableCallback() {
      var _this4 = this;

      // console.log('clearableCallback')
      this.inputValue = this.clearValue;
      this.$nextTick(function () {
        return _this4.$refs.input.focus();
      });
    }
  },
  render: function render() {
    // console.log('render arguments', arguments)
    return this.genInputGroup(this.genInput(), {
      attrs: {
        tabindex: false
      }
    });
  }
};

/* istanbul ignore next */

VNumberField.install = function install(Vue) {
  Vue.component(VNumberField.name, VNumberField);
};

module.exports = VNumberField;
