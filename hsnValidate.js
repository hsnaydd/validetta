/*!
 * hsnLightBox - jQuery Eklentisi
 * version: 1.0 (30 Mart 2013, Cumartesi)
 * @jQuery v1.7 ve üstü ile çalışmaktadır.
 *
 * Örneklere http://... adresinden  ulaşabilirsiniz.
 * Projeye Adresi : https://github.com/hsnayd/hsnValidate 
 * Lisans: MIT ve GPL
 * 	* http://www.opensource.org/licenses/mit-license.php
 *  * http://www.gnu.org/licenses/gpl.txt
 *
 * Copyright 2012 Hasan Aydoğdu - http://www.hasanaydogdu.com
 *
 */

(function($){
	var handler = false,obje,
	ayarlar = {
		hataClass 			:	'formHata',
		hataKapaClass 		:	'formHataKapa',
		hataMesajBos 		:	'Bu alanı doldurmanız gerekli. Lütfen kontrol ediniz.',
		hataMesajEmail		:	'Eposta adresiniz geçersiz görünüyor. Lütfen kontrol ediniz.',
		hataMesajNumara		:	'Bu alana sadece rakam girişi yapabilirsiniz.',
		hataMesajCheckbox	: 	'Bu alanı işaretmeleniz gerekli. Lütfen kontrol ediniz.',
		blurTetikleme		: 	true,
		fonksiyon			: 	null	
	},
	temizle = function(value){
		return value = value.replace(/^\s+|\s+$/g, '');
	},
	kontrol = {
		//Bosluk Kontrolu
		bosluk : function(_input){
				if(temizle($(_input).val()) == ''){
				return pencere.ac(_input,ayarlar.hataMesajBos);
				}else{return;}
		},
		//Mail Kontrolu
		mail : function(_input){
			//var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/; 
			var reg = new RegExp(/^[a-z]{1}[\d\w\.-]+@[\d\w-]{3,}\.[\w]{2,3}(\.\w{2})?$/);
			if((reg.test($(_input).val()) == false) && ($(_input).val()!='')){return pencere.ac(_input,ayarlar.hataMesajEmail);}
			else{return;}
		},
		//Numara Kontrolu
		numara : function(_input){
			var reg = new RegExp(/^[\+][0-9]+?$|^[0-9]+?$/);
			if((reg.test($(_input).val()) == false) && ($(_input).val()!='')){return pencere.ac(_input,ayarlar.hataMesajNumara);}
			else{return;}
		},
		//Checkbox Kontrolu
		checkbox : function(_inp){
			if (!$(_inp).is(':checked')){
				return pencere.ac(_inp,ayarlar.hataMesajCheckbox);
			}else{return;}
		}
	},
	pencere = {
		ac : function(_input,hata){
			var pos= $(_input).position(),
			gen = $(_input).width(),
			yuk = $(_input).height(),
			_top= pos.top,
			hsnHataObje = $('<span>').addClass(ayarlar.hataClass),
			hsnHataKapatObje = $('<span class="hsnHataKapat">x</span>');
			hsnHataKapatObje.addClass(ayarlar.hataKapaClass);
			hsnHataObje.empty().css({
				'left':pos.left+gen+30+'px',
				'top' :_top+'px'
			});
			$(_input).parent().append(hsnHataObje);
			hsnHataObje.append(hata,hsnHataKapatObje);
			handler = true; 
		},
		kapa : function(_input){
			$(_input).parent().children('.'+ayarlar.hataClass+'').remove();
			 handler = false;
		}
	},
	basla = function(){
			//console.log(obje.nodeType == 1)
			if(obje.tagName =='FORM'){
				$.hsnValidate.reset($(obje).find('input[type="text"],textarea,input[type="checkbox"]'));
				$(obje).find('.required').each(function(i,name) {
					if($(name).attr('type')=='checkbox'){kontrol.checkbox(name);}
					else{kontrol.bosluk(name);}
				});
				$(obje).find('.email').each(function(i,name) {;
					kontrol.mail(name);
				});
				$(obje).find('.number').each(function(i,name) {
					kontrol.numara(name);
				});
			}else{
				$.hsnValidate.reset($(obje));
				if($(obje).hasClass('required')){
					if($(obje).attr('type')=='checkbox'){kontrol.checkbox(obje);}
					else{kontrol.bosluk(obje);}
				}
				if ($(obje).hasClass('email')){
					kontrol.mail(obje);
				}
				if($(obje).hasClass('number')){
					kontrol.numara(obje);
				}
			}
			if(handler){return false;}
				else{
					if(ayarlar.fonksiyon){
						ayarlar.fonksiyon()
						return false;
					}else{return;}
				}
	};
	$.fn.hsnValidate = function(ayar){
		ayarlar = $.extend({},ayarlar,ayar);
		$(this).submit(function(e){
			e.preventDefault();
			obje = this;
			basla();
		});
		if(ayarlar.blurTetikleme){
			$(this).find('input[type="text"],input[type="checkbox"],textarea').bind('blur',function(){
				obje = this;
				basla();
			});
		};
	};	
	/* Fonksiyonlar */
	$.hsnValidate = function() {
		//ilerde kullanırız
	};
	$.hsnValidate.reset = function(_inp) {
		handler = false;
		_inp.each(function(index, name) {
			$(name).parent().children('.'+ayarlar.hataClass+'').remove();
		});	
	};
	$.hsnValidate.baslangic = function() {
		//Reset Butonuna Tıklanınca Sıfırlama
		$('input[type="reset"]').click(function(e) {
    		$.hsnValidate.reset($(this).parents('form').find('input[type="text"],textarea,input[type="checkbox"]'));
    	});
    	//Manuel Hata Kapatma
		$(document).on('click','.hsnHataKapat', function(){
			$(this).parent().remove();
				return false;
		});
	};
    $(document).ready(function() {
    	$.hsnValidate.baslangic();
    });
	
	
})(jQuery);
