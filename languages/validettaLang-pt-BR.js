(function($){
	$.fn.validettaLanguage = function(){	
	}
	$.validettaLanguage = {
		init : function(){
			$.validettaLanguage.messages = {
				empty 		: 'Preencha este campo.',
		        email   	: 'Insira um endereço de e-mail válido.',
		        number    	: 'Insira apenas números.',
		        maxLength 	: 'Insira no máximo {count} caracteres.',
		        minLength 	: 'Insira no mínimo {count} caracteres.',
		        checkbox  	: 'Marque esta caixa de seleção se deseja continuar.',
		        maxChecked  : 'Marque no máximo {count} opções.',
		        minChecked  : 'Marque no mínimo {count} opções.',
		        selectbox 	: 'Selecione um item da lista.',
		        maxSelected : 'Selecione no máximo {count} itens',
		        minSelected : 'Selecione no mínimo {count} itens',
		        notEqual  	: 'Os campos não são iguais.',
		        creditCard  : 'Número do cartão de crédito inválido.'
			};
		}
	}
	$.validettaLanguage.init();
})(jQuery);