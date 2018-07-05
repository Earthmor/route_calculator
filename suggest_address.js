(function ($) {

    $.fn.suggestAddress = function(options)
    {
        return this.each(function() {
            var $this = $(this);

            $this.keyup(function()
            {
                $.getJSON("http://suggest-maps.yandex.ru/suggest-geo?callback=?",
                    {
                        lang:   'ru-RU',
                        ll:     '30.31349700000001,59.93853099999102',
                        spn:    '0.9564971923828303,0.20569192165599048',
                        part: $this.val().toLowerCase(),
                        highlight: 1,
                        fullpath: 1,
                        sep: 1,
                        search_type: 'all'
                    },
                    function(data)
                    {
                        if (data.length >= 2)
                        {
                            var suggests = data[1];
                            var tags = [];

                            for (var i = 0, suggestCount = suggests.length; i < suggestCount; i++)
                            {
                                if (suggests[i].length >= 3)
                                {
                                    var suggest = suggests[i][2].split(/\s*,\s*/);
                                    var street = suggests[i][2];
                                    tags.push(street);
                                }
                            }
                        }
                        $this.autocomplete($.extend({
                            source: function(request, response)
                            {
                                var re = request.term.replace(/[., ]+/g, " ");
                                var matcher = new RegExp($.ui.autocomplete.escapeRegex(re), "i");
                                var retval = $.grep(tags, function(item)
                                {
                                    return matcher.test(item.replace(/[., ]+/g, " "));
                                });
                                response(retval);
                            }}, options))
                    })
            });

        });
    }

}( jQuery ));