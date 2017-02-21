
  //相册功能 2017-02-20 add
  var page = 1;
  var offset = 20;

  function photoRender(page ,data){
    var begin = (page - 1) * offset;
    var end = page * offset;
    if (begin >= data.length) return;
    var html, li = "";
    for (var i = begin; i < end && i < data.length; i++) {
        li += '<li><div class="img-box">' +
            '<a class="img-bg" rel="example_group" href="https://raw.githubusercontent.com/fantasticZhang/blog-back-up/master/photos/' + data[i] + '?raw=true"></a>' +
            '<img lazy-src="https://raw.githubusercontent.com/fantasticZhang/blog-back-up/master/photos/' + data[i] + '?raw=true" />' +
            '</li>';
    }

    $(".img-box-ul").append(li);
    $(".img-box-ul").lazyload();
    $("a[rel=example_group]").fancybox();
  }

  function photoScroll(data){
    $(window).scroll(function() {
        var windowPageYOffset = window.pageYOffset;
        var windowPageYOffsetAddHeight = windowPageYOffset + window.innerHeight;
        var sensitivity = 0;

        var offsetTop = $(".instagram").offset().top + $(".instagram").height();

        if (offsetTop >= windowPageYOffset && offsetTop < windowPageYOffsetAddHeight + sensitivity) {
            photoRender(++page, data);
        }
    })
  }

  var photoInit = function() {
      $.getJSON("/photos/output.json", function (data) {
          photoRender(page, data);

          photoScroll(data);
      });
  }
