const DOMAINS_TO_SHOW_AD = new Array();
$(document).ready(function () {
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": site_js.helpers.escape(
                $('meta[name="csrf-token"]').attr("content")
            ),
        },
    });

    site_js.controller.run();
    site_js.widget.run();

    site_js.helpers.setWidth();

    $("body").on("click", "[data-submit]", function (e) {
        e.preventDefault();

        var self = $(this);
        var id = site_js.helpers.escape(self.attr("data-form-id"));

        $("form#" + id)
            .find("[data-send]")
            .click();
    });

    var urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("jump")) {
        site_js.helpers.jump("." + urlParams.get("jump"));
    }

    $(window).resize(function () {
        site_js.helpers.setWidth();
    });
});
