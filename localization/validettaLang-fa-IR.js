(function($){
	$.fn.validettaLanguage = {};
	$.validettaLanguage = {
		init : function(){
      			$.validettaLanguage.messages = {
                		required	: 'این فیلد الزامی است . لطفا آن را تکمیل نمایید',
                		email		: 'پست الکترونیک وارد شده صحیح نیست.',
                		number		: 'در این فیلد فقط می توانید عدد وارد کنید',
                		maxLength	: 'بیشتر تعداد کاراکتر مجاز {count} است.',
                		minLength	: 'کمترین تعداد کاراکتر مجاز {count} است.',
                		maxChecked	: 'حد اکثر می تواند {count} آیتم را انتخاب کنید',
                		minChecked	: 'حداقل باید {count} آیتم را انتخاب کنید',
                		maxSelected : 'حداکثر {count} انتخاب مجاز است.',
                		minSelected : 'حداقل {count} انتخاب باید انجام دهید.',
                		notEqual	: 'فیلد ها برابر نیستند . لطفا مجددا بررسی کنید',
                		creditCard	: 'شماره کارت وارد شده صحیح نمی باشد . مجددا بررسی کنید'
      			};
		}
	};
	$.validettaLanguage.init();
})(jQuery);
