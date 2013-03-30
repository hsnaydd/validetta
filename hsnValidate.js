/* jQuery 1.7+ */

(function($){
	var handler = false,obje,
	ayarlar = {
		'hataClass' 		:	'formHata',
		'hataKapaClass' 	:	'formHataKapa',
		'hataMesajBos' 		:	'Bu alanı doldurmanız gerekli. Lütfen kontrol ediniz.',
		'hataMesajEmail'	:	'Eposta adresiniz geçersiz görünüyor. Lütfen kontrol ediniz.',
		'hataMesajNumara'	:	'Bu alana sadece rakam girişi yapabilirsiniz.',
		'fonksiyon'			: 	null	
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
			hsnHataKapatObje.addClass(ayarlar.hataKapa);
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
			$.hsnValidate.reset($(obje).find('input[type="text"],textarea'));
			$(obje).find('.required').each(function(i,name) {
				kontrol.bosluk(name);
			});
			$(obje).find('.email').each(function(i,name) {;
				kontrol.mail(name);
			});
			$(obje).find('.number').each(function(i,name) {
				kontrol.numara(name);
			});
			if(handler){return false;}
			else{
				if(ayarlar.fonksiyon){
					ayarlar.fonksiyon()
					return false;
				}else{return;}
			}
	};
	$.fn.hsnValidate = function(ayar){
		$(this).submit(function(e){
			e.preventDefault();
			ayarlar = $.extend({},ayarlar,ayar);
			obje = this;
			basla();
		});
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
    		$.hsnValidate.reset($(this).parents('form').find('input[type="text"],textarea'));
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
