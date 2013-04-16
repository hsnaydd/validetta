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
	var handler = false,form,object,
	defaults = {
		errorClass 		: 'formHata',
		errorCloseClass : 'formHataKapa',
		errorMessage : {
			empty		: 'Bu alanı doldurmanız gerekli. Lütfen kontrol ediniz.',
			email		: 'Eposta adresiniz geçersiz görünüyor. Lütfen kontrol ediniz.',
			number		: 'Bu alana sadece rakam girişi yapabilirsiniz.',
			maxLength	: 'Max {count} karakter girebilirsiniz !',
			minLength	: 'Minimum {count} karakter girmelisiniz! ',
			checkbox	: 'Bu alanı işaretmeleniz gerekli. Lütfen kontrol ediniz.',
			maxChecked	: 'En fazla {count} seçim yapabilirsiniz. Lütfen kontrol ediniz.',
			minChecked	: 'En az {count} seçim yapmalısınız. Lütfen kontrol ediniz.',
			selectbox	: 'Bu alanda seçim yapmanız gerekli. Lütfen kontrol ediniz.',
			maxSelected : 'En fazla {count} seçim yapabilirsiniz. Lütfen kontrol ediniz.',
			minSelected : 'En az {count} seçim yapmalısınız. Lütfen kontrol ediniz.',
			notEqual	: 'Alanlar birbiriyle oyuşmuyor. Lütfen kontrol ediniz',
			creditCard	: 'Kredi kartı numarası geçersiz. Lütfen kontrol ediniz.'
		},
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
		onCompleteFunc	: $.noop	
	},
	clear = function(value){
		return value = value.replace(/^\s+|\s+$/g, '');
	},
	check = {
		//Bosluk Kontrolu
		space : function(_inp){
				return (clear($(_inp).val()) == '') ? false : true;
		},
		//Mail Kontrolu
		mail : function(_inp){
			var reg = new RegExp(/^[a-z]{1}[\d\w\.-]+@[\d\w-]{3,}\.[\w]{2,3}(\.\w{2})?$/);
			return ((reg.test($(_inp).val()) == false) && $(_inp).val()!='') ? false : true ;
		},
		//Numara Kontrolu
		number : function(_inp){
			var reg = new RegExp(/^[\+][0-9]+?$|^[0-9]+?$/);
			return ((reg.test($(_inp).val()) == false) && $(_inp).val()!='') ?  false : true;
		},
		//Minimum uzunluk kontrol
		minLength : function(_inp,val){
			var _length = $(_inp).val().length;
			return ( _length < val && _length != 0) ? false : true;
		},
		//Max uzunluk kontrol
		maxLength : function(_inp,val){
			return ($(_inp).val().length > val) ? false : true;
		},
		//Eşitlik kontrolü
		equal : function(_inp,val){
			return ($(form).find('input[type=text][name='+val+']').val() != $(_inp).val()) ? false : true;
		},
		//Kredi kartı kontrolü
		creditCard : function(_inp){
			var reg = new RegExp(/[^0-9]+/g),
			cardNumber = $(_inp).val().replace(reg,''),
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
			maxChecked : function(_inp,val){	
				var name = $(_inp).attr('name'),
				    count = $(form).find('input[type="checkbox"][name="'+name+'"]').filter(':checked').length;
				return (count > val) ? false : true;
			},
			minChecked : function(_inp,val){
				var name = $(_inp).attr('name'),
				    count = $(form).find('input[type="checkbox"][name="'+name+'"]').filter(':checked').length;
				return (count < val) ? false : true;
			}
		},
		//Selectbox Kontrolü
		selectbox : {
			selected : function(_inp){
				var val = $(_inp).val();
				return (val == '' || val == null) ? false : true;
			},
			maxSelected : function(_inp,val){
				var count = $(_inp).val();
				return (count != null && count != '' && count.length > val) ? false : true;	
			},
			minSelected : function(_inp,val){
				var count = $(_inp).val();
				return (count != null && count != '' && count.length < val) ? false : true;
			}
		}
	},
	_window = {
		open : function(_inp,error){
			if($(_inp).parent().find('.'+options.errorClass).length > 0 ) return;
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
		if((!options.ajax.url && $(form).attr('action')=='')) console.log('Form action not valid !');
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
			var reg = RegExp(/(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength|equal)\[(\w){1,10}\]/i);
			$(object).each(function(i, element){
				var el = element, errors ='',
				methods = $(el).data('hsnvalidate').split(',');
				$(methods).each(function(i, element) {
					if(element == 'required'){
						if($(el).attr('type')=='checkbox' && !check.checkbox.checked(el)){errors += options.errorMessage.checkbox+'<br>';}
						else if(el.tagName =='SELECT' && !check.selectbox.selected(el)){errors += options.errorMessage.selectbox+'<br>';}
						else if(($(el).attr('type') =='text' || el.tagName =='TEXTAREA') && !check.space(el)){errors += options.errorMessage.empty+'<br>';}	
					}
					if(element == 'number' && !check.number(el)){
						errors += options.errorMessage.number+'<br>';
					}
					if(element == 'email' && !check.mail(el)){
						errors += options.errorMessage.email+'<br>';
					}
					if(element == 'creditCard' && $(el).val()!='' && !check.creditCard(el)){
						errors += options.errorMessage.creditCard+'<br>';
					}	
					if(reg.test(element)){
						var rules = element.split(/\[|,|\]/);
						if(rules[0] == 'maxLength' && !check.maxLength(el,rules[1])){
							errors += options.errorMessage.maxLength.replace('{count}',rules[1])+'<br>';
						}else if(rules[0] == 'minLength' && !check.minLength(el,rules[1])){
							errors += options.errorMessage.minLength.replace('{count}',rules[1])+'<br>';
						}else if(rules[0] == 'maxChecked' && !check.checkbox.maxChecked(el,rules[1])){
							var name = $(el).attr('name');
							el = $(object).filter('[type=checkbox][name='+name+']').eq(0);
							errors += options.errorMessage.maxChecked.replace('{count}',rules[1])+'<br>';
						}else if(rules[0] == 'minChecked' && !check.checkbox.minChecked(el,rules[1]) ){
							var name = $(el).attr('name');
							el = $(object).filter('[type=checkbox][name='+name+']').eq(0);
							errors += options.errorMessage.minChecked.replace('{count}',rules[1])+'<br>';
						}else if(rules[0] == 'maxSelected' && !check.selectbox.maxSelected(el,rules[1])){
							errors += options.errorMessage.maxSelected.replace('{count}',rules[1])+'<br>';
						}else if(rules[0] == 'minSelected' && !check.selectbox.minSelected(el,rules[1])){
							errors += options.errorMessage.minSelected.replace('{count}',rules[1])+'<br>';
						}else if(rules[0] == 'equal' && !check.equal(el,rules[1])){
							errors += options.errorMessage.notEqual+'<br>'
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
