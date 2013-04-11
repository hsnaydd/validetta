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
 /*
 	* required
	* number
	* email
	* minlength
	* maxlength
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
			checkbox	: 'Bu alanı işaretmeleniz gerekli. Lütfen kontrol ediniz.',
			maxChecked	: 'En fazla {count} seçim yapabilirsiniz. Lütfen kontrol ediniz.',
			minChecked	: 'En az {count} seçim yapmalısınız. Lütfen kontrol ediniz.',
			selectbox	: 'Bu alanda seçim yapmanız gerekli. Lütfen kontrol ediniz.'
		},
		checkbox : {
			name	: null,
			max		: null,
			min		: null		
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
		space : function(_input){
				if(clear($(_input).val()) == ''){
				return _window.open(_input,options.errorMessage.empty);
				}else{return;}
		},
		//Mail Kontrolu
		mail : function(_input){
			//var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/; 
			var reg = new RegExp(/^[a-z]{1}[\d\w\.-]+@[\d\w-]{3,}\.[\w]{2,3}(\.\w{2})?$/);
			if((reg.test($(_input).val()) == false) && ($(_input).val()!='')){return _window.open(_input,options.errorMessage.email);}
			else{return;}
		},
		//Numara Kontrolu
		number : function(_input){
			var reg = new RegExp(/^[\+][0-9]+?$|^[0-9]+?$/);
			if((reg.test($(_input).val()) == false) && ($(_input).val()!='')){return _window.open(_input,options.errorMessage.number);}
			else{return;}
		},
		//Checkbox Kontrolu
		checkbox : {
			checked : function(_inp){
						if (!$(_inp).is(':checked')){
							return _window.open(_inp,options.errorMessage.checkbox);
						}else{return;}
					},
			limit  : function(_inp){
						var max,min,
						count = _inp.filter(':checked').length;
						if((max = options.checkbox.max) && count > max){
							return _window.open(_inp.eq(0),options.errorMessage.maxChecked.replace('{count}',max));
						}else if((min = options.checkbox.min) && count < min){
							return _window.open(_inp.eq(0),options.errorMessage.minChecked.replace('{count}',min));
						}else{return;}
					}
		},
		//Selectbox Kontrolü
		selectbox : {
			selected : function(_inp){
				var val = $(_inp).val();
				if(val == '' || val == null){
					return _window.open(_inp, options.errorMessage.selectbox);
				}else{return;}
			},
			limit : function(_inp){
				var max,min,
					count = _inp.lenght;
					console.log(count);		
			}
			
		}
	},
	_window = {
		open : function(_input,error){
			var pos= $(_input).position(),
			W = $(_input).width(),
			H = $(_input).height(),
			T= pos.top,
			errorObject = $('<span>').addClass(options.errorClass),
			errorCloseObject = $('<span class="hsnErrClose">x</span>');
			errorCloseObject.addClass(options.errorCloseClass);
			errorObject.empty().css({
				'left':pos.left+W+30+'px',
				'top' :T+'px'
			});
			$(_input).parent().append(errorObject);
			errorObject.append(error,errorCloseObject);
			handler = true; 
		},
		close : function(_input){
			$(_input).parent().children('.'+options.errorClass+'').remove();
			 handler = false;
		}
	},
	ajax = function(){
		var data = $(obje).serialize(),request,
			url = (options.ajax.url) ? options.ajax.url : $(obje).attr('action');
		/* Debug */
		if((!options.ajax.url && $(obje).attr('action')=='')) console.log('Form action not valid !');
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
	init = function(){
			$.hsnValidate.reset($(object));
			var reg = RegExp(/(minChecked|maxChecked|minSelected|maxSelected|minLength|maxLength)\[([0-9])\]/i);
			$(object).each(function(i, element){
				var el = element,
				methods = $(el).data('hsnvalidate').split(',');
				$(methods).each(function(i, element) {
					if(element == 'required'){
						if($(el).attr('type')=='checkbox'){check.checkbox.checked(el);}
						else if(el.tagName =='SELECT'){check.selectbox.selected(el);}
						else{check.space(el);}
					}
					if(element == 'number'){
						check.number(el);
					}
					if(element == 'email'){
						check.mail(el);
					}
					if(reg.test(element)){
						var rules = element.split(/\[|,|\]/)
						console.log(rules[1])
					}
                });
                
            });
			
			
			//console.log(obje.nodeType == 1)
			/*if(obje.tagName =='FORM'){
				$.hsnValidate.reset($(obje).find('.'+options.errorClass));
				$(obje).find('.required').each(function(i,name){
					if($(name).attr('type')=='checkbox'){check.checkbox.checked(name);}
					else if(name.tagName =='SELECT'){check.selectbox.selected(name);}
					else{check.space(name);}
				});
				$(obje).find('.email').each(function(i,name) {;
					check.mail(name);
				});
				$(obje).find('.number').each(function(i,name) {
					check.number(name);
				});
				if(name = options.checkbox.name){
					var cbs = $(obje).find('input[type="checkbox"][name="'+name+'"]');
					check.checkbox.limit(cbs);
				};
			}else{
				$.hsnValidate.reset($(obje));
				var name;
				if($(obje).hasClass('required')){
					if($(obje).attr('type')=='checkbox'){check.checkbox.checked(obje);}
					else if(obje.tagName =='SELECT'){check.selectbox.selected(obje);}
					else{check.space(obje);}
				}
				if ($(obje).hasClass('email')){
					check.mail(obje);
				}
				if($(obje).hasClass('number')){
					check.number(obje);
				}
				if((name = options.checkbox.name) && obje.type == 'checkbox'){
					var cbs = $(obje).parents('form').find('input[type="checkbox"][name="'+name+'"]');
					$.hsnValidate.reset(cbs);
					check.checkbox.limit(cbs);
				};
				handler = true;
			}
			if(handler){return false;}
			else{*/
				/*if(options.onCompleteFunc){
					options.onCompleteFunc()
					return false;
				}else{return;}*/
				/*if(options.ajax.call){
					ajax();
					return false;	
				}
			}*/
	};
	$.fn.hsnValidate = function(ayar){
		options = $.extend(true,{},defaults,ayar);
		form = this;
		$(form).submit(function(e){
			e.preventDefault();
			object = $(form).find('[data-hsnValidate]');
			init();
		});
		if(options.blurTrigger){
			$(form).find('[data-hsnValidate]').on('blur',function(){
				object = this;
				init();
			});
		};
	};	
	/* Fonksiyonlar */
	$.hsnValidate = function() {
		//ilerde kullanırız
	};
	$.hsnValidate.reset = function(_inp) {
		//handler = false;
		_inp.each(function(index, name) {
			_window.close(name)
			//$(name).parent().children('.'+options.errorClass+'').remove();
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
