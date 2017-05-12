/* 
 * Copyright 2017 Pascal Lola
 * Updated 05/12/2017 @ 1:32AM
 */

//the line of code below will remove certain "irrelevant" javascript warnings
/*global $:false, jQuery: false, Chart:false, console:false, document:false, window:false, alert:false, location:false, localStorage:false, google:false, c3:false, moment:false, setTimeout:false */
/*jslint regexp: true, plusplus: true */


function loadDataSet() {
  "use strict";
  $.ajax({
    url: "data/tresor-sleep-training-data.json",
    dataType: 'json',
    async: true,
    success: function (data) {
        //do someting if the data loads successfully
      console.log(data[0]);
    },
    error: function () {
      console.log('error loading sleep data.');
    }
  });
}//end loadDataSet function

var timeSeriesChart;
function initializeC3Chart() {
  "use strict";
  timeSeriesChart = c3.generate({
    bindto: '#chart',
    data: {
      x: 'times',
      xFormat: '%Y-%m-%d %H:%M:%S', // how the date is parsed
      columns: [
        ['times', '2015-09-17 18:20:34', '2015-09-17 18:25:42', '2015-09-17 18:30:48'],
        ['data', '1539', '1546', '1546', '1550']
      ]
    },
    axis: {
      x: {
        type: 'timeseries',
        tick: {
          format: '%Y-%m-%d %H:%M:%S' // how the date is displayed
        }
      }
    }
  });
} //end initializeC3Chart function

window.onload = function () {
  "use strict";
  loadDataSet();
  initializeC3Chart();
};