/* 
 * Copyright 2017 Pascal Lola
 * Updated 04/28/2017 @ 12:25AM
 */
//the line of code below will remove certain "irrelevant" javascript warnings
/*global $:false, jQuery: false, Highcharts:false, Chart:false, console:false, document:false, window:false, alert:false, location:false, localStorage:false, google:false, c3:false, moment:false, setTimeout:false */
/*jslint regexp: true, plusplus: true */

/*var timeSeriesChart;

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
}*/ //end initializeC3Chart function 

var dateArray, startDate, stopDate, jsonData, hoursArray, heatmapData;



function initializeLineChart() {
   "use strict";
   Highcharts.chart('line-container', {
      xAxis: {
         type: 'datetime'
      },
      credits: {
         enabled: false
      },
      series: [{
         data: [
            [Date.UTC(2010, 0, 1, 10, 10), 29.9],
            [Date.UTC(2010, 0, 1, 10, 11), 71.5],
            [Date.UTC(2010, 0, 2, 10, 20), 106.4]
         ]
      }]
   });
}



function getDates(startDate, stopDate, format) {
   "use strict";
   dateArray = [];
   startDate = moment(startDate, "MM/DD/YY");
   stopDate = moment(stopDate, "MM/DD/YY");
   while (startDate <= stopDate) {
      dateArray.push(moment(startDate).format(format));
      startDate = moment(startDate).add(1, 'days');
   }
   return dateArray;
}


function getRandomNumber() {
   "use strict";
   var randInt = Math.floor((Math.random() * 300) + 1);
   return randInt;
}


function initializeHeatmap() {
   "use strict";
   $('#heatmap-container').highcharts({
      chart: {
         type: 'heatmap',
         marginTop: 75,
         marginBottom: 0,
         height: window.innerHeight - 65,
         inverted: true
      },
      credits: {
         enabled: false
      },

      title: {
         text: null
      },

      xAxis: {
         categories: dateArray
         //opposite: 'true'
      },

      yAxis: {
         categories: hoursArray,
         opposite: true,
         title: null
      },

      colorAxis: {
         min: 0,
         minColor: '#FFFFFF',
         maxColor: '#164E70'
      },

      legend: {
         align: 'right',
         layout: 'vertical',
         margin: 0,
         verticalAlign: 'top',
         y: 75,
         symbolHeight: 320
      },

      tooltip: {
         formatter: function () {
            return 'Baby Slept <b>' + this.point.value + '</b> minutes on <b>' + this.series.xAxis.categories[this.point.x] + '</b> at <b>' + this.series.yAxis.categories[this.point.y] + '</b>';
         }
      },

      series: [{
         name: 'Sleep Per Hour of Day',
         borderWidth: 0.2,
         data: heatmapData,
         dataLabels: {
            enabled: false,
            color: 'black',
            style: {
               textShadow: 'none'
            }
         }
      }]

   });
}


//In this case, density applies to the heatmap cell color density value. This could be any integer (minutes, hours, etc)
function getDensity(date, type) {
   "use strict";
   var density = 0,
      sleepCycles = [];
   for (var i = 0; i < jsonData.length; i++) {
      if (moment(jsonData[i].Date, "MM/DD/YYYY").format('MM.DD.YY') === date) { //work around for moment.isSame throwing a deprecation warning
         sleepCycles.push(jsonData[i]);
      } else {
         //console.log("no match");
      }
   }

   /*
    * INTERVENTIONS
    * Experiment to see patterns of interventions per day...next step is by hour...which hour had the most intervention
    */
   var k; //variable to iterate through each sleep cycle that contains the same date as the date passed into this function
   if (type == "interventions") {
      for (k = 0; k < sleepCycles.length; k++) {
         density += sleepCycles[k].Interventions || 0; //if the value from intervention is an empty string/null make it = 0
      }
      return density;
   }


   /* DURATION
    * Iterate through each hour of the day and determine how much of that hour the baby was sleeping based on the data in the tempArray.
    */
   if (type == "duration") {
      for (k = 0; k < sleepCycles.length; k++) {
         //density = getRandomNumber();
         var startTime = moment(sleepCycles[k].Actual_Sleep_Time, 'hh:mm:ss a');
         var endTime, remainingDuration = sleepCycles[k].Total_Sleep;
         for(var hourIndex = 0; hourIndex < hoursArray.length; hourIndex++){
            endTime = moment(hoursArray[hourIndex], 'hh:mm:ss a');
            density = Math.max(0, endTime.diff(startTime, 'minutes'));//make density 0 if we get a negative number
            remainingDuration = remainingDuration - density;
            //pick up here by >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> how to properly get the right duration <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
            console.log(moment(endTime).format('hh:mm:ss a') + " - " + moment(startTime).format('hh:mm:ss a') + " = slept for " + density + " minutes" + " remaining duration is " + remainingDuration);  
            //console.log(density);
         }

      }
   }
   return density;
}

window.onload = function () {
   "use strict";
   //initializeC3Chart();
   //initializeLineChart();
   //initializeHeatmap();
   var tempArray, density;
   dateArray = getDates("04/17/17", "05/16/17", "MM.DD.YY");

   hoursArray = ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'];

   $.ajax({
      url: "data/tresor-sleep-training-data.json",
      dataType: 'json',
      async: true,
      success: function (data) {
         jsonData = data;
         heatmapData = [];
         for (var dateIndex = 0; dateIndex < dateArray.length; dateIndex++) {
            density = getDensity(dateArray[dateIndex], "duration");
            for (var hourIndex = 0; hourIndex < hoursArray.length; hourIndex++) {
               tempArray = [dateIndex, hourIndex, density];
               heatmapData.push(tempArray);
            }
         }
         initializeHeatmap();
      },
      error: function () {
         console.log('error loading sleep data.');
      }
   });
};
