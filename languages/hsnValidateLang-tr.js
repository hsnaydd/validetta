(function($){
	$.fn.hsnValidateLanguage = function(){	
	}
	$.hsnValidateLanguage = {
		init : function(){
			$.hsnValidateLanguage.messages = {
				empty		: 'This field is required!',
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
			};
		}
	}
	$.hsnValidateLanguage.init();
})(jQuery);