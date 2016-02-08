var api = require('indeed-api').getInstance("7726699244359231");

// do a job search
api.JobSearch()
    .Radius(20)
    .WhereLocation({
        city : "Atlanta",
        state : "GA"
    })
    .Limit(2)
    .WhereKeywords(["JavaScript"])
    .SortBy("date")
    .UserIP("1.2.3.4")
    .UserAgent("Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36")
    .Search(
        function (results) {
        // do something with the success results
        console.log(results);
    },
        function (error) {
        // do something with the error results
        console.log(error);
    })
;

$(function() {
  $('form#search input[type=submit]').on("click", api.JobSearch());
});
