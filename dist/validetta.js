/*!
 * Validetta (http://lab.hasanaydogdu.com/validetta/)
 * Version 1.0.1
 * Licensed under MIT (https://github.com/hsnayd/validetta/blob/master/LICENCE)
 * Copyright 2013-2015 Hasan Aydoğdu - http://www.hasanaydogdu.com 
 */
/*eslint-env es6:false*/

(function($) {
  'use strict';
  /**
   *  Declare variables
   */
  var FIELDS = {}; // Current fields/fields
  // RegExp for input validation rules
  var RRULE = new RegExp(/^(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|equalTo|different|regExp|remote|callback)\[(\w{1,15})\]/i);
  // RegExp for mail control method
  // @from (http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29)
  var RMAIL = new RegExp(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/);
  //RegExp for input number control method
  var RNUMBER = new RegExp(/^[\-\+]?(\d+|\d+\.?\d+)$/);

  /**
   *  Form validate error messages
   */
  var messages = {
    required  : 'This field is required.',
    email     : 'Your E-mail address appears to be invalid.',
    number    : 'You can enter only numbers in this field.',
    maxLength : 'Maximum {count} characters allowed!',
    minLength : 'Minimum {count} characters allowed!',
    maxChecked  : 'Maximum {count} options allowed.',
    minChecked  : 'Please select minimum {count} options.',
    maxSelected : 'Maximum {count} selection allowed.',
    minSelected : 'Minimum {count} selection allowed.',
    notEqual    : 'Fields do not match.',
    different   : 'Fields cannot be the same as each other',
    creditCard  : 'Invalid credit card number.',
  };

  /**
   *  Plugin defaults
   */
  var defaults = {
    showErrorMessages : true, // If you dont want to display error messages set this options false
    inputWrapperClass : 'form-field', // Class of the parent container we want to append the error message to
    errorTemplateClass : 'form-inline-message', // Class of the error message string
    errorClass : 'form-input-error', // Class added to parent of each failing validation field
    validClass : 'form-input-valid', // Same for valid validation
    realTime: false, // To enable real-time form control, set this option true.
    onValid: function(){}, // This function to be called when the user submits the form and there is no error.
    onError: function(){}, // This function to be called when the user submits the form and there are some errors
    validators: {}, // Custom validators stored in this variable
  };

  /**
   * Clears the left and right spaces of given parameter.
   * This is the function for string parameter!
   * If parameter is an array, function will return the untrimmed parameter
   *
   * @param {string} value
   * @return {mixed}
   */
  var trim = function(value) {
    return typeof value === 'string' ? value.replace(/^\s+|\s+$/g, '') : value;
  };

  /**
   * Validator
   * {count} which used below is the specified maximum or minimum value
   * e.g if method is minLength and  rule is 2 (minLength[2])
   * Output error messages text will be : 'Please select minimum 2 options.'
   *
   * @namespace
   * @param {object} tmp = this.tmp Tmp object for store current field and its value
   * @param {String} val: field value
   */
  var Validator = {
    required: function(tmp, self) {
      switch (tmp.el.type) {
        case 'checkbox' : return tmp.el.checked || messages.required;
        case 'radio' : return this.radio.call(self, tmp.el) || messages.required;
        case 'select-multiple' : return tmp.val !== null || messages.required;
        default : return tmp.val !== '' || messages.required;
      }
    },

    //  Mail check - it checks the value if it's a valid email address or not
    email: function(tmp) {
      return RMAIL.test(tmp.val) || messages.email;
    },

    // Number check
    number: function(tmp) {
      return RNUMBER.test(tmp.val) || messages.number;
    },

    // Minimum length check
    minLength: function(tmp) {
      var _length = tmp.val.length;
      return _length === 0 || _length >= tmp.arg || messages.minLength.replace('{count}', tmp.arg);
    },

    // Maximum lenght check
    maxLength: function(tmp) {
      return tmp.val.length <= tmp.arg || messages.maxLength.replace('{count}', tmp.arg);
    },

    // equalTo check
    equalTo: function(tmp, self) {
      return self.form.querySelector('input[name="' + tmp.arg + '"]').value === tmp.val || messages.notEqual;
    },

    different: function(tmp, self) {
      return self.form.querySelector('input[name="' + tmp.arg + '"]').value !== tmp.val || messages.different;
    },

    /**
     * Credit Card Control
     * @from : http://af-design.com/blog/2010/08/18/validating-credit-card-numbers
     */
    creditCard: function(tmp) {
      if (tmp.val === '') return true; // allow empty because empty check does by required metheod
      var reg;
      var cardNumber;
      var pos;
      var digit;
      var i;
      var subTotal;
      var sum = 0;
      var strlen;
      reg = new RegExp(/[^0-9]+/g);
      cardNumber = tmp.val.replace(reg, '');
      strlen = cardNumber.length;
      if (strlen < 16) return messages.creditCard;
      for (i = 0 ; i < strlen ; i++) {
        pos = strlen - i;
        digit = parseInt(cardNumber.substring(pos - 1, pos), 10);
        if (i % 2 === 1) {
          subTotal = digit * 2 ;
          if (subTotal > 9) {
            subTotal = 1 + (subTotal - 10);
          }
        } else {
          subTotal = digit ;
        }
        sum += subTotal ;
      }
      if (sum > 0 && sum % 10 === 0) return true;
      return messages.creditCard;
    },

    //Checkbox check
    maxChecked: function(tmp, self) {
      var cont = $(self.form.querySelectorAll('input[type=checkbox][name="' + tmp.el.name + '"]'));
      // we dont want to show an error message for all checkboxes which have same "name"
      if (cont.index(tmp.el) !== 0) return;
      var count =  cont.filter(':checked').length;
      if (count === 0) return;
      return count <= tmp.arg || messages.maxChecked.replace('{count}', tmp.arg);
    },

    minChecked: function(tmp, self) {
      var cont = $(self.form.querySelectorAll('input[type=checkbox][name="' + tmp.el.name + '"]'));
      if (cont.index(tmp.el) !== 0) return; // same as above
      var count =  cont.filter(':checked').length;
      return count >= tmp.arg || messages.minChecked.replace('{count}', tmp.arg);
    },

    //Selectbox check
    maxSelected: function(tmp) {
      if (tmp.val === null) return;
      return tmp.val.length <= tmp.arg || messages.maxSelected.replace('{count}', tmp.arg);
    },

    minSelected: function(tmp) {
      return (tmp.val !== null && tmp.val.length >= tmp.arg) || messages.minSelected.replace('{count}', tmp.arg);
    },

    // Radio
    radio: function(el) {
      var count = this.form.querySelectorAll('input[type=radio][name="' + el.name + '"]:checked').length;
      return count === 1;
    },

    // Custom reg check
    regExp: function(tmp, self) {
      var _arg = self.options.validators.regExp[tmp.arg];
      var _reg = new RegExp(_arg.pattern);
      return _reg.test(tmp.val) || _arg.errorMessage;
    },

    // Remote
    remote: function(tmp) {
      tmp.remote = tmp.arg;
      return;
    },

    // Callback
    callback: function(tmp, self) {
      var _cb = self.options.validators.callback[tmp.arg];
      return _cb.callback(tmp.el, tmp.val) || _cb.errorMessage;
    },
  };

  /**
   * Plugin Class
   *
   * @constructor
   * @param {object} form : <form> element which being controlled
   * @param {object} options : User-specified settings
   * @return {method} events
   */
  var Validetta = function(form, options) {
    /**
     *  Public  Properties
     *  @property {mixed} handler It is used to stop or resume submit event handler
     *  @property {object} options Property is stored in plugin options
     *  @property {object} xhr Stores xhr requests
     *  @property {object} form Property is stored in <form> element
     */
    this.handler = false;
    this.options = $.extend(true, {}, defaults, options);
    this.form = form;
    this.xhr = {};
    this.events();
  };

  Validetta.prototype = {

    constructor : Validetta,

    /**
     * This is the method of handling events
     *
     * @return {mixed}
     */
    events: function() {
      var self = this; // stored this
      // Handle submit event
      $(this.form).submit(function(event) {
        // fields to be controlled transferred to global variable
        FIELDS = this.querySelectorAll('[data-validates]');
        return self.init(event);
      });
      // real-time option control
      if (this.options.realTime === true) {
        // handle change event for form elements (without checkbox)
        $(this.form).find('[data-validates]').not('[type=checkbox]').on('change', function(event) {
          // field to be controlled transferred to global variable
          FIELDS = $(this);
          return self.init(event);
        });
        // handle click event for checkboxes
        $(this.form).find('[data-validates][type=checkbox]').on('click', function(event) {
          // fields to be controlled transferred to global variable
          FIELDS = self.form.querySelectorAll('[data-validates][type=checkbox][name="' + this.name + '"]');
          return self.init(event);
        });
      }
      // handle <form> reset button to clear error messages
      $(this.form).on('reset', function() {
        $(self.form.querySelectorAll('.' + self.options.errorClass + ' , .' + self.options.validClass))
          .removeClass(self.options.errorClass + ' ' + self.options.validClass);
        return self.reset();
      });
    },

    /**
     * In this method, fields are validated
     *
     * @params {object} e : event object
     * @return {mixed}
     */
    init: function(event) {
      event.preventDefault();
      // Reset error messages from all elements
      this.reset(FIELDS);
      // Start control each elements
      this.checkFields(event);
      if (event.type !== 'submit') return; // if event type is not submit, break
      // This is for when running remote request, return false and wait request response
      else if (this.handler === 'pending') return false;
      // if event type is submit and handler is true, break submit and call onError() function
      else if (this.handler === true) { this.options.onError.call(this, event); return false; }
      else return this.options.onValid.call(this, event); // if form is valid call onValid() function
    },

    /**
     * Checks Fields
     *
     * @param  {object} e event object
     * @return {void}
     */
    checkFields: function(event) {
      var self = this; // stored this
      var invalidFields = [];

      // Make invalidFields accessible
      this.getInvalidFields = function(){
        return invalidFields;
      };

      for (var i = 0, _lengthFields = FIELDS.length; i < _lengthFields; i++) {
        // if field is disabled, do not check
        if (FIELDS[i].disabled) continue;
        var el = FIELDS[i]; //current field
        var errors = ''; //current field's errors
        var val = trim($(el).val()); //current field's value
        var methods = el.getAttribute('data-validates').split(','); //current field's control methods
        var state; // Validation state
        // Create tmp
        this.tmp = {};
        // store el and val variables in tmp
        this.tmp = { el : el, val : val, parent : this.parents(el) };
        // Start to check fields
        // Validator : Fields Control Object
        for (var j = 0, _lengthMethods = methods.length; j < _lengthMethods; j++) {
          // Check Rule
          var rule = methods[j].match(RRULE);
          var method;
          // Does it have rule?
          if (rule !== null) {
            // Does it have any argument ?
            if (typeof rule[2] !== 'undefined') this.tmp.arg = rule[2];
            // Set method name
            method = rule[1];
          } else { method = methods[j]; }
          // prevent empty validation if method is not required
          if (val === '' && method !== 'required' && method !== 'equalTo') continue;
          // Is there a method in Validator ?
          if (Validator.hasOwnProperty(method)) {
            // Validator returns error message if method invalid
            state = Validator[method](self.tmp, self);
            if (typeof state !== 'undefined' && state !== true) {
              var _dataMsg = el.getAttribute('data-vd-message-' + method);
              if (_dataMsg !== null) state = _dataMsg;
              errors += state + '<br>';
            }
          }
        }

        // Check the errors
        if (errors !== '') {
          invalidFields.push({
            field: el,
            errors: errors,
          });
          // if parent element has valid class, remove and add error class
          this.addErrorClass(this.tmp.parent);
          // show error message
          this.notify.show.call(this , el, errors);
        // Check remote validation
        } else if (typeof this.tmp.remote !== 'undefined') {
          this.checkRemote(el, event);
        } else { // Nice, there are no error
          if (typeof state !== 'undefined') this.addValidClass(this.tmp.parent);
          else $(this.tmp.parent).removeClass(this.options.errorClass + ' ' + this.options.validClass);
          state = undefined; // Reset state variable
        }
      }
    },

    /**
     * Checks remote validations
     *
     * @param  {object} el current field
     * @param  {object} e event object
     * @throws {error} If previous remote request for same value has rejected
     * @return {void}
     */
    checkRemote: function(el, event) {
      var ajaxOptions = {};
      var data = {};
      var fieldName = el.name || el.id;

      if (typeof this.remoteCache === 'undefined') this.remoteCache = {};

      data[fieldName] = this.tmp.val; // Set data
      // exends ajax options
      ajaxOptions = $.extend(true, {}, {
        data: data,
      }, this.options.validators.remote[this.tmp.remote] || {});

      // use $.param() function for generate specific cache key
      var cacheKey = $.param(ajaxOptions);

      // Check cache
      var cache = this.remoteCache[cacheKey];

      if (typeof cache !== 'undefined') {
        switch(cache.state) {
          case 'pending' : // pending means remote request not finished yet
            this.handler = 'pending'; // update handler and cache event type
            cache.event = event.type;
            break;
          case 'rejected' : // rejected means remote request could not be performed
            event.preventDefault(); // we have to break submit because of throw error
            throw new Error(cache.result.message);
          case 'resolved' : // resolved means remote request has done
            // Check to cache, if result is invalid, show an error message
            if (cache.result.valid === false) {
              this.addErrorClass(this.tmp.parent);
              this.notify.show.call(this, el, cache.result.message);
            } else {
              this.addValidClass(this.tmp.parent);
            }
        }
      } else {
        // Abort if previous ajax request still running
        var _xhr = this.xhr[fieldName];
        if (typeof _xhr !== 'undefined' && _xhr.state() === 'pending') _xhr.abort();
        // Start caching
        cache = this.remoteCache[cacheKey] = { state : 'pending', event : event.type };
        // make a remote request
        this.remoteRequest(ajaxOptions, cache, el, fieldName);
      }
    },

    /**
     * Calls ajax request for remote validations
     *
     * @param  {object} ajaxOptions Ajax options
     * @param  {object} cache Cache object
     * @param  {object} el processing element
     * @param  {string} fieldName Field name for make specific caching
     * @param  {object} event Event object
     */
    remoteRequest: function(ajaxOptions, cache, el, fieldName) {
      var self = this;

      $(this.tmp.parent).addClass('validetta-pending');

      // cache xhr
      this.xhr[fieldName] = $.ajax(ajaxOptions)
        .done(function(result) {
          if (typeof result !== 'object') result = JSON.parse(result);
          cache.state = 'resolved';
          cache.result = result;
          if (cache.event === 'submit') {
            self.handler = false;
            $(self.form).trigger('submit');
          } else if (result.valid === false) {
            self.addErrorClass(self.tmp.parent);
            self.notify.show.call(self, el, result.message);
          } else {
            self.addValidClass(self.tmp.parent);
          }
        })
        .fail(function(jqXHR, textStatus) {
          if (textStatus !== 'abort') { // Dont throw error if request is aborted
            var _msg = 'Ajax request failed for field (' + fieldName + ') : ' + jqXHR.status + ' ' + jqXHR.statusText;
            cache.state = 'rejected';
            cache.result = { valid: false, message : _msg };
            throw new Error(_msg);
          }
        })
        .always(function() { $(self.tmp.parent).removeClass('validetta-pending'); });

      this.handler = 'pending';
    },

    /**
     * Showing or hiding error messages
     *
     * @namespace
     */
    notify: {
      /**
       * Error message shows
       *
       * @params {object} el : element which has an error (it can be native element or jQuery object)
       * @params {string} error : error messages
       */
      show: function(el, error) {
        // We want display errors ?
        if (!this.options.showErrorMessages) {
          // because of form not valid, set handler true for break submit
          this.handler = true;
          return;
        }
        var elParent = this.parents(el);
        // If the parent element undefined, that means el is an object. So we need to transform to the element
        if (typeof elParent === 'undefined') elParent = el[0].parentNode;
        // if there is an error message which previously shown for el, return
        if (elParent.querySelectorAll('.' + this.options.errorTemplateClass).length) return;
        // Create the error message object
        var errorObject = document.createElement('span');
        errorObject.className = this.options.errorTemplateClass;
        elParent.appendChild(errorObject);
        errorObject.innerHTML = error ;

        // we have an error so we need to break submit
        // set to handler true
        this.handler = true;
      },
      /**
       * Error message hides
       *
       * @params el : the error message which will be disappear
       */
      hide: function(el) {
        el.parentNode.removeChild(el);
      },
    },


    /**
     * Removes all error messages
     *
     * @param {object} or {void} el : form elements which have an error message
     */
    reset: function(el) {
      var _errorMessages = {};
      // if el is undefined (This is the process of resetting all <form>)
      // or el is an object that has element more than one
      // and these elements are not checkbox
      if (typeof el === 'undefined' || (el.length > 1 && el[0].type !== 'checkbox')) {
        _errorMessages = this.form.querySelectorAll('.' + this.options.errorTemplateClass);
      } else {
        _errorMessages = this.parents(el[0]).querySelectorAll('.' + this.options.errorTemplateClass);
      }
      for (var i = 0, _lengthErrorMessages = _errorMessages.length; i < _lengthErrorMessages; i++) {
        this.notify.hide.call(this, _errorMessages[i]);
      }
      // set to handler false
      // otherwise at the next validation attempt, submit will not continue even the validation is successful
      this.handler = false;
    },

    /**
     * Adds error class and removes valid class if exist
     *
     * @param {object} el element
     */
    addErrorClass: function(el) {
      $(el).removeClass(this.options.validClass).addClass(this.options.errorClass);
    },

    /**
     * Adds valid class and removes error class if exist
     * if error class not exist, do not add valid class
     *
     * @param {object} el element
     */
    addValidClass: function(el) {
      $(el).removeClass(this.options.errorClass).addClass(this.options.validClass);
    },

    /**
     * Finds parent element
     *
     * @param  {object} el element
     * @return {object} el parent element
     */
    parents: function(el) {
      return $(el).parents('.' + this.options.inputWrapperClass)[0];
    },
  };

  /**
   * Plugin Validetta
   *
   * @param {object} options : User-specified settings
   * @return {object} this
   */
  $.fn.validetta = function(options, _messages) {
    if ($.validettaLanguage) {
      messages = $.extend(true, {}, messages, $.validettaLanguage.messages);
    }
    if (typeof _messages !== 'undefined') {
      messages = $.extend(true, {}, messages, _messages);
    }
    return this.each(function() {
      new Validetta(this, options);
    });
  };
})(jQuery);
