(function($){
	$.fn.validettaLanguage = {};
	$.validettaLanguage = {
		init : function(){
			$.validettaLanguage.messages = {
				required	: 'Preencha este campo.',
				email		: 'Insira um endereço de e-mail válido.',
				number		: 'Insira apenas números.',
				maxLength	: 'Insira no máximo {count} caracteres.',
				minLength	: 'Insira no mínimo {count} caracteres.',
				maxChecked	: 'Marque no máximo {count} opções.',
				minChecked	: 'Marque no mínimo {count} opções.',
				maxSelected : 'Selecione no máximo {count} itens',
				minSelected : 'Selecione no mínimo {count} itens',
				notEqual	: 'Os campos não são iguais.',
				creditCard	: 'Número do cartão de crédito inválido.'
			};
		}
	};
	$.validettaLanguage.init();
})(jQuery);