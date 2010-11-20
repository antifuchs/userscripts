// Add simple keyboard navigation to l1sp.org's search.
// version 0.1 BETA!
// 2010-11-19
// Copyright (c) 2010, Andreas Fuchs <asf@boinkor.net>
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          Cursor key navigation for l1sp.org
// @namespace     http://l1sp.org
// @description   Let users select an entry using cursor keys.
// @include       http://l1sp.org/search*
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js
// ==/UserScript==

// Chrome doesn't support @require. This is annoying, but there's a solution:
// http://erikvold.com/blog/index.cfm/2010/6/14/using-jquery-with-a-user-script
function addJQuery(callback) {
    if (window.$ !== undefined) return(callback());
    var script = document.createElement("script");
    script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js");
    script.addEventListener('load', function() {
        var script = document.createElement("script");
        script.textContent = "(" + callback.toString() + ")();";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
}

function main() {
    var handleKeys = true;
    
    function findMostRelevant(term) {
        // Note that this order is entirely my own preference:
        var relevances = ['cl', 'clim', 'sbcl', 'mop', 'clx', 'pcl', 'ccl'];
        return $('li tt a').map(function(i, elt) {
            var rank = $.inArray(elt.text.split('/')[1], relevances);
            if (rank == -1)
                rank = relevances.length+1;
            rank *= 100;

            rank -= $('b', elt).text().length / elt.text.length;

            return {'rank': rank,
                    'elt': elt};
        }).sort(function(a,b) { return a.rank - b.rank; })[0].elt;
    }

    function makeCurrent(li) {
        if (!li) return;
        $('li.current').removeClass('current');
        $(li).addClass('current');
    }

    function moveCurrentTo(direction) {
        var lis = $('li');
        var current = lis.index($('li.current'));
        if (current == -1) current = 0;
        var next = Math.min(Math.max(0, current + direction), lis.length-1);
        makeCurrent(lis[next]);
    }

    function handleKey(event) {
        if (!handleKeys) return;
        
        switch(event.keyCode) {
            case 75: // k
            case 38: // up
                moveCurrentTo(-1);
                return false;
            case 74: // j
            case 40: // down
                moveCurrentTo(+1);
                return false;
            case 13: // return
                page = $('li.current a').attr('href');
                if (page)
                    window.location.href = page;
                return false;
            case 191: // / key
                turnOffKeys();
                $('input[name="q"]').focus();
                return false;
            default:
                //console.log('Key ', event.keyCode);
                break;
        }
        return true;
    }

    function setCurrent() {
        var searchedFor = window.location.search.match(/q=([^&]+)\&?/)[1];
        if (searchedFor) {
            var best = findMostRelevant(searchedFor);
            makeCurrent($(best).parents('li'));
        } else {
            makeCurrent($('li').first());
        }
    }
    
    function turnOffKeys() {
        handleKeys = false;
    }
    
    function turnOnKeys() {
        handleKeys = true;
    }
    
    setCurrent();
    // install next/prev handlers
    $(document).keyup(handleKey);
    $('input[type=text]').focus(turnOffKeys);
    $('input[type=text]').blur(turnOnKeys);

    // A bit of CSS. Ugly, but it does the trick:
    $('body').append($('<style type="text/css">\
      li.current { \
          background-color: yellow;\
          list-style-type: disc;\
      }\
      li { list-style-type: circle; }\
    </style>'));
}

addJQuery(main);