$(document).ready(function(){
    $('#mainNav').on('click', 'nav dd', function(){
        $('#mainFrame').load(this.getAttribute('link'));
        $(this).addClass('selected').siblings().removeClass('selected');
    });
    $('#mainNav dd.firstload').trigger('click');
});