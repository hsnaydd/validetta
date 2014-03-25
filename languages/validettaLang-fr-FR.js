(function($){
	$.fn.validettaLanguage = function(){	
	}
	$.validettaLanguage = {
		init : function(){
			$.validettaLanguage.messages = {
				empty 		: 'Ce champ est requis.',
        email   	: 'Adresse e-mail non valide',
        number    	: 'Ce champ accepte seulement des valeurs numériques.',
        maxLength 	: 'Vous devez saisir au maximum {count} caractères.',
        minLength 	: 'Vous devez saisir au minimum {count} caractères.',
        checkbox  	: 'Vous devez cocher cette case pour continuer.',
        maxChecked  : 'Vous ne pouvez cocher pas plus de {count} cases.',
        minChecked  : 'Vous devez cocher au moins {count} cases.',
        selectbox 	: 'Vous devez sélectionner un élément de la liste.',
        maxSelected : 'Vous ne pouvez sélectionner plus de {count} options.',
        minSelected : 'Vous devez sélectionner au moins {count} options.',
        notEqual  	: 'Les valeurs ne correspondent pas.',
        creditCard  : 'Numéro de carte de crédit pas valide.'
			};
		}
	}
	$.validettaLanguage.init();
})(jQuery);