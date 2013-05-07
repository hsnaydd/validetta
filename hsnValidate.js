/*!
 * hsnValidate - jQuery Eklentisi
 * version: 1.0 (30 Mart 2013, Cumartesi)
 * @jQuery v1.7 ve üstü ile çalışmaktadır.
 *
 * Örneklere http://... adresinden  ulaşabilirsiniz.
 * Proje Adresi : https://github.com/hsnayd/hsnValidate 
 * Lisans: MIT ve GPL
 * 	* http://www.opensource.org/licenses/mit-license.php
 *  * http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2012 Hasan Aydoğdu - http://www.hasanaydogdu.com
 *
 */

(function($){
	"use strict"
	var handler = false,form,object,options,
	messages = {
		empty		: 'This field is required. Please be sure to check.',
		email		: 'Your E-mail address appears to be invalid. Please be sure to check.',
		number		: 'You can only enter numbers in this field.',
		maxLength	: 'Maximum {count} characters allowed!',
		minLength	: 'Minimum {count} characters allowed! ',
		checkbox	: 'This checkbox is required. Please be sure to check.',
		maxChecked	: 'Maximum {count} options allowed. Please be sure to check.',
		minChecked	: 'Please select minimum {count} options.',
		selectbox	: 'Please select an option.',
		maxSelected : 'Maximum {count} selection allowed. Please be sure to check.',
		minSelected : 'Minimum {count} selection allowed. Please be sure to check.',
		notEqual	: 'Fields do not match. Please be sure to check.',
		creditCard	: 'Invalid credit card number. Please be sure to check.'
	},
	defaults = {
		errorClass 		: 'formHata',
		errorCloseClass : 'formHataKapa',
		ajax : {
			call 		: false,
			type		: 'GET',
			url			: null,
			dataType	: 'html',
			beforeSend	: $.noop,
			success 	: $.noop,
			fail		: $.noop,
			complete	: $.noop
		},
		blurTrigger		: true,
		onCompleteFunc	: $.noop,
		customReg		: {}	
	},
	clear = function(value){
		return value = value.replace(/^\s+|\s+$/g, '');
	},
	check = {
		//Empty Space Control
		space : function(val){
				return (clear(val) == '') ? false : true;
		},
		//Mail Kontrolu
		mail : function(val){
			var reg = new RegExp(/^[a-z]{1}[\d\w\.-]+@[\d\w-]{3,}\.[\w]{2,3}(\.\w{2})?$/);
			return ((reg.test(val) == false) && val!='') ? false : true ;
		},
		//Numara Kontrolu
		number : function(val){
			var reg = new RegExp(/^[\+][0-9]+?$|^[0-9]+?$/);
			return ((reg.test(val) == false) && val!='') ?  false : true;
		},
		//Minimum uzunluk kontrol
		minLength : function(val,arg){
			var _length = val.length;
			return ( _length < arg && _length != 0) ? false : true;
		},
		//Max uzunluk kontrol
		maxLength : function(val,arg){
			return (val.length > arg) ? false : true;
		},
		//Equal Control
		equal : function(val,arg){
			return ($(form).find('input[type=text][name='+arg+']').val() != val) ? false : true;
		},
		/*	Credit Card Control
			@ From : http://af-design.com/blog/2010/08/18/validating-credit-card-numbers 
		*/
		creditCard : function(val){
			var reg = new RegExp(/[^0-9]+/g),
			cardNumber = val.replace(reg,''),
			pos, digit, i, sub_total, sum = 0,
			strlen = cardNumber.length;
			if(strlen < 16){return false;}
			for(i=0;i<strlen;i++){
				pos = strlen - i;
				digit = parseInt(cardNumber.substring(pos - 1, pos));
				if(i % 2 == 1){
					sub_total = digit * 2;
					if(sub_total > 9){
						sub_total = 1 + (sub_total - 10);
					}
				} else {
					sub_total = digit;
				}
				sum += sub_total;
			}
			if(sum > 0 && sum % 10 == 0){
				return true;
			}
			return false;
		},
		//Checkbox Kontrolu
		checkbox : {
			checked : function(_inp){
						return (!$(_inp).is(':checked')) ? false : true;
			},
			maxChecked : function(_inp,arg){	
				var name = $(_inp).attr('name'),
				    count = $(form).find('input[type="checkbox"][name="'+name+'"]').filter(':checked').length;
				return (count > arg) ? false : true;
			},
			minChecked : function(_inp,arg){
				var name = $(_inp).attr('name'),
				    count = $(form).find('input[type="checkbox"][name="'+name+'"]').filter(':checked').length;
				return (count < arg) ? false : true;
			}
		},
		//Selectbox Kontrolü
		selectbox : {
			selected : function(val){
				return (val == '' || val == null) ? false : true;
			},
			maxSelected : function(val,arg){
				return (val != null && val != '' && val.length > arg) ? false : true;	
			},
			minSelected : function(val,arg){
				return (val != null && val != '' && val.length < arg) ? false : true;
			}
		},
		customReg : function(val,reg){
			var reg = new RegExp(reg);
			return ((reg.test(val) == false) && val!='') ? false : true ;
		}
	},
	_window = {
		open : function(_inp,error){
			if($(_inp).parent().find('.'+options.errorClass).length > 0 ){return;}
			var pos= $(_inp).position(),
			W = $(_inp).width(),
			H = $(_inp).height(),
			T= pos.top,
			errorObject = $('<span>').addClass(options.errorClass),
			errorCloseObject = $('<span class="hsnErrClose">x</span>');
			errorCloseObject.addClass(options.errorCloseClass);
			errorObject.empty().css({
				'left':pos.left+W+30+'px',
				'top' :T+'px'
			});
			$(_inp).parent().append(errorObject);
			errorObject.append(error,errorCloseObject);
			handler = true; 
		},
		close : function(_inp){
			$(_inp).parent().children('.'+options.errorClass+'').remove();
			 handler = false;
		}
	},
	ajax = function(){
		var data = $(form).serialize(),request,
			url = (options.ajax.url) ? options.ajax.url : $(form).attr('action');
		/* Debug */
		(!options.ajax.url && $(form).attr('action')=='') && console.log('Form action not valid !');
		$.ajax({
			type 	: options.ajax.type,
			url		: url,
			data	: data,
			dataType: options.ajax.dataType,
			options: options,
			beforeSend: function(){
				return options.ajax.beforeSend();
			}
		})
		.done(function(result){options.ajax.success(result);})
		.fail(function(jqXHR, textStatus){ options.ajax.fail(jqXHR, textStatus);})
		.always(function(result){options.ajax.complete(result);});	
	},
	init = function(e){
			$.hsnValidate.reset($(object));
			var reg = RegExp(/(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|equal|custom)\[(\w){1,10}\]/i);
			$(object).each(function(i, element){
				var el = element, errors ='',val = $(el).val(),
				methods = $(el).data('hsnvalidate').split(',');
				$(methods).each(function(i, element) {
					if(element == 'required'){
						if($(el).attr('type')=='checkbox' && !check.checkbox.checked(el)){errors += messages.checkbox+'<br />';}
						else if(el.tagName =='SELECT' && !check.selectbox.selected(val)){errors += messages.selectbox+'<br />';}
						else if(($(el).attr('type') =='text' || el.tagName =='TEXTAREA') && !check.space(val)){errors += messages.empty+'<br />';}	
					}
					if(element == 'number' && !check.number(val)){
						errors += messages.number+'<br />';
					}
					if(element == 'email' && !check.mail(val)){
						errors += messages.email+'<br />';
					}
					if(element == 'creditCard' && val!='' && !check.creditCard(val)){
						errors += messages.creditCard+'<br />';
					}	
					if(reg.test(element)){
						var rules = element.split(/\[|,|\]/);
						if(rules[0] == 'maxLength' && !check.maxLength(val,rules[1])){
							errors += messages.maxLength.replace('{count}',rules[1])+'<br />';
						}else if(rules[0] == 'minLength' && !check.minLength(val,rules[1])){
							errors += messages.minLength.replace('{count}',rules[1])+'<br />';
						}else if(rules[0] == 'maxChecked' && !check.checkbox.maxChecked(el,rules[1])){
							var name = $(el).attr('name');
							el = $(object).filter('[type=checkbox][name='+name+']').eq(0);
							errors += messages.maxChecked.replace('{count}',rules[1])+'<br />';
						}else if(rules[0] == 'minChecked' && !check.checkbox.minChecked(el,rules[1]) ){
							var name = $(el).attr('name');
							el = $(object).filter('[type=checkbox][name='+name+']').eq(0);
							errors += messages.minChecked.replace('{count}',rules[1])+'<br />';
						}else if(rules[0] == 'maxSelected' && !check.selectbox.maxSelected(val,rules[1])){
							errors += messages.maxSelected.replace('{count}',rules[1])+'<br />';
						}else if(rules[0] == 'minSelected' && !check.selectbox.minSelected(val,rules[1])){
							errors += messages.minSelected.replace('{count}',rules[1])+'<br />';
						}else if(rules[0] == 'equal' && !check.equal(val,rules[1])){
							errors += messages.notEqual+'<br />'
						}else if(rules[0] == 'custom' && !check.customReg(val,options.customReg[rules[1]].method)){
							errors += (options.customReg[rules[1]].errorMessage || messages.empty)+'<br />'
						}
					}
                });
				(errors != '') && _window.open(el,errors);
            });
			if(handler || e.type != 'submit'){return false;}
			else{
				/*if(options.onCompleteFunc){
					options.onCompleteFunc()
					return false;
				}else{return;}*/
				if(options.ajax.call){
					ajax();
					return false;	
				}
			}
	};
	$.fn.hsnValidate = function(ayar){
		options = $.extend(true,{},defaults,ayar);
		if($.hsnValidateLanguage){
			messages = $.extend(true,{},messages,$.hsnValidateLanguage.messages);
		}
		form = this;
		$(form).submit(function(e){
			e.preventDefault();
			object = $(form).find('[data-hsnValidate]');
			init(e);
		});
		if(options.blurTrigger){
			$(form).find('[data-hsnValidate]').not('[type=checkbox]').on('blur',function(e){
				object = this;
				init(e);
			});
			$(form).find('[data-hsnValidate][type=checkbox]').on('click',function(e){
				var name = $(this).attr('name');
				object = $(form).find('[data-hsnValidate][type=checkbox][name='+name+']').get(0);
				init(e);
			});
			$(form).find('select[data-hsnValidate]').change(function(e){
				object = this;
				init(e);
			});
		};
	};	
	/* Fonksiyonlar */
	$.hsnValidate = function() {
		//ilerde kullanırız
	};
	$.hsnValidate.reset = function(_inp) {
		_inp.each(function(index, name) {
			_window.close(name)
		});	
	};
	$.hsnValidate.init = function() {
		//Reset Butonuna Tıklanınca Sıfırlama
		$('input[type="reset"]').click(function(e) {
    		$.hsnValidate.reset($(this).parents('form').find('.'+options.errorClass));
    	});
    	//Manuel Hata Kapatma
		$(document).on('click','.hsnErrClose', function(){
			$(this).parent().remove();
				return false;
		});
	};
    $(document).ready(function() {
    	$.hsnValidate.init();
    });	
})(jQuery);
