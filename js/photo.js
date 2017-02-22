
  //相册功能 2017-02-20 add
  var page = 1;
  var offset = 20;

  function photoShow(page ,data){
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

// offset() 方法设置或返回被选元素 相对于文档的偏移坐标
//  top: $(selector).offset().top;
//  left: $(selector).offset().left;

//  height() 方法返回或设置匹配元素的高度
//pageXOffset 设置或返回当前页面相对于窗口显示区左上角的 X 位置。
// pageYOffset 设置或返回当前页面相对于窗口显示区左上角的 Y 位置。
// innerheight	返回窗口的文档显示区的高度。
// innerwidth	返回窗口的文档显示区的宽度
  function photoScroll(data){
    $(window).scroll(function() {
        var windowPageYOffset = window.pageYOffset;
        var windowPageYOffsetAddHeight = windowPageYOffset + window.innerHeight;
      //  var sensitivity = 0;
        var offsetTop = $(".photos").offset().top + $(".photos").height();
        if (offsetTop >= windowPageYOffset && offsetTop < windowPageYOffsetAddHeight) {
            photoShow(++page, data);
        }
    })
  }

  var photoInit = function() {
      $.getJSON("/photos/output.json", function (data) {
          photoShow(page, data);

          photoScroll(data);
      });
  }
