(function($){
	$.fn.validettaLanguage = function(){	
	}
	$.validettaLanguage = {
		init : function(){
			$.validettaLanguage.messages = {
				empty 		: 'Campo obligatorio.',
        email   	: 'Correo electrónico no válido.',
        number    	: 'Este campo sólo acepta valores numéricos.',
        maxLength 	: 'Este campo acepta como máximo {count} caracteres.',
        minLength 	: 'Este campo requiere como mínimo {count} caracteres.',
        checkbox  	: 'Es necesario marcar este campo para continuar.',
        maxChecked  : 'Sólo se puede marcar {count} opciones como máximo.',
        minChecked  : 'Es necesario marcar como mínimo {count} opciones.',
        selectbox 	: 'Es necesario seleccionar un elemento de la lista.',
        maxSelected : 'Sólo se puede marcar {count} opciones como máximo.',
        minSelected : 'Es necesario marcar como mínimo {count} opciones.',
        notEqual  	: 'Los campos no coinciden.',
        creditCard  : 'Tarjeta de crédito no válida.'
			};
		}
	}
	$.validettaLanguage.init();
})(jQuery);