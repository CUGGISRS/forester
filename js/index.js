;(function(){
    new Vue({
        el: '#app',
        data: {
            menus: MENUS,
            selected: ''
        },
        watch: {
            selected: function(v, o) {
                var self = this, targetId;
                var menu = this.menus.filter(function(item){
                    return item.id == v;
                })[0];
                if(!menu) return;
                if (menu.needCache && menu.cached) {
                    $('#menu_items_' + menu.type + '_' + menu.id).show().siblings().hide();
                } else if (menu.needCache && !menu.cached) {
                    this.creatElement(menu.id);
                } else if (!menu.needCache && menu.cached) {
                    if (menu.type == 'load') {
                        $('#menu_items_load_public').load(menu.link).show().siblings().hide();
                    } else {
                        $('#menu_items_iframe_public').attr('src', menu.link).show().siblings().hide();
                    }
                } else if (!menu.needCache && !menu.cached) {
                    this.creatElement('public');
                }
            }
        },
        created: function () {
            this.selected = 'home';
        },
        methods: {
            creatElement: function(name){
                var self = this;
                var menu = this.menus.filter(function(item){
                    return item.id == self.selected;
                })[0];
                menu.cached = true;
                name = 'menu_items_' + menu.type + '_' + name;
                if (menu.type == 'load') {
                    $('#menu_items').append($('<div id="'+ name +'" class="h100 w100 hidden"></div>').load(menu.link));
                } else {
                    $('#menu_items').append('<iframe src="' + menu.link + '" class="h100 w100 hidden" id="'+ name +'" name="'+ name +'" frameborder="no" border="0" allowscriptaccess="always" marginwidth="0" marginheight="0" allowfullscreen="true" wmode="opaque" allowTransparency="true" type="application/x-shockwave-flash"></iframe>');
                }
                $('#' + name).show().siblings().hide();
            }
        }
    })
})();