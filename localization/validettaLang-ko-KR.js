(function($){
	$.fn.validettaLanguage = {};
	$.validettaLanguage = {
		init : function(){
			$.validettaLanguage.messages = {
				required  : '이 항목은 필수 입력사항입니다.',
				email   : '올바른 이메일 형식을 입력해주세요.',
				number    : '숫자만 입력 가능합니다.',
				maxLength : '최대 {count} 글자까지 입력 가능합니다.',
				minLength : '최소 {count} 글자를 입력해야 합니다.',
				maxChecked  : '최대 {count} 개의 옵션만 선택이 가능합니다.',
				minChecked  : '최소 {count} 개의 옵션을 선택해야 합니다.',
				maxSelected : '최대 {count} 개 선택 가능합니다.',
				minSelected : '최소 {count} 개 선택해야 합니다.',
				notEqual  : '값이 같지 않습니다.',
				different   : '이 항목의 값은 다른 항목의 값과는 달라야 합니다.',
				creditCard  : '올바른 신용카드 형식을 입력해주세요.'
			};
		}
	};

	$.validettaLanguage.init();
})(jQuery);
