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
    var randInt = Math.floor((Math.random() * 60) + 1);
    return randInt;
}


function initializeHeatmap() {
    "use strict";
    $('#heatmap-container').highcharts({
        chart: {
            type: 'heatmap',
            marginTop: 45,
            marginBottom: 0,
            height: window.innerHeight - 155,
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
            minColor: '#FFDE7D',
            maxColor: '#00B8A9'
        },

        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'top',
            y: 30,
            symbolHeight: 350
        },

        tooltip: {
            formatter: function () {
                return 'Slept <b>' + this.point.value + '</b> minutes <br/> On <b>' + this.series.xAxis.categories[this.point.x] + '</b> <br/>At the <b>' + this.series.yAxis.categories[this.point.y] + '</b> hour';
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


var midnightCarryOver = 0; //use this variable to bring in hours from previous nights.
//In this case, density applies to the heatmap cell color density value. This could be any integer (minutes, hours, etc)
function getDensity(date, type) {
    "use strict";
    var density = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        sleepSessions = [];

    //Get all the sleep cycle objects for this date.
    for (var i = 0; i < jsonData.length; i++) {
        if (moment(jsonData[i].Date, "MM/DD/YYYY").format('MM.DD.YY') === date) { //work around for moment.isSame throwing a deprecation warning
            sleepSessions.push(jsonData[i]);
        } else {
            //console.log("no match");
        }
    }

    /*
     * INTERVENTIONS
     * Experiment to see patterns of interventions per day...next step is by hour...which hour had the most intervention
     */
    /* var k; //variable to iterate through each sleep cycle that contains the same date as the date passed into this function
    if (type == "interventions") {
       for (k = 0; k < sleepCycles.length; k++) {
          density[] += sleepCycles[k].Interventions || 0; //if the value from intervention is an empty string/null make it = 0
       }
       return density;
    }*/



    /* DURATION
     * Iterate through each hour of the day and determine how much of that hour the baby was sleeping based on the data in the tempArray.
     */
    if (type == "duration") {
        var sessionDate, startTime, currentHour, nextHour,
            midnight, wakeTime, inBedTime;


        //if midnightCarryOver is greater than 0, spread that value across 
        if (midnightCarryOver > 0) {
            console.log("There is a carry over from previous day of " + midnightCarryOver);
            if (midnightCarryOver > 60) {
                for (var m = 0; m < Math.floor(midnightCarryOver / 60); m++) {
                    density[m] = 60;
                }
                density[m] = midnightCarryOver % 60;
            } else {
                density[0] = midnightCarryOver;

            }
        } else {
            console.log("There is a carry over from previous day of " + midnightCarryOver);
        }


        for (var k = 0; k < sleepSessions.length; k++) {
            startTime = moment(date + " " + sleepSessions[k].Actual_Sleep_Time, 'MM/DD/YYYY hh:mm a');
            inBedTime = moment(date + " " + sleepSessions[k].Sleep_Started, 'MM/DD/YYYY hh:mm a');
            wakeTime = moment(date + " " + sleepSessions[k].Wake_Up_Time, 'MM/DD/YYYY hh:mm a');

            if (startTime.isBefore(inBedTime)) {
                startTime.add(1, "days");
            }

            if (wakeTime.isBefore(startTime)) { //for wake times that go to the next day
                wakeTime.add(1, "days");
                midnight = moment(date + " " + '12:00 am', 'MM/DD/YYYY hh:mm a').add(1, "days");
                midnightCarryOver = parseInt(moment.duration(wakeTime.diff(midnight)).asMinutes());
            } else {
                midnightCarryOver = 0;
            }



            //for each hour of the day for each sleep cycle object do the following:
            for (var h = 0; h < hoursArray.length; h++) {
                currentHour = moment(date + " " + hoursArray[h], 'MM/DD/YYYY hh:mm a');

                //if the current hour is before the sleep start hour
                if (currentHour.isBefore(startTime, 'hour')) {
                    //do nothing

                    //if the current hour is same hour as the sleep start hour and the wake time is not in the same hour
                } else if (currentHour.isSame(startTime, 'hour') && wakeTime.isAfter(startTime, 'hour')) {
                    nextHour = moment(currentHour); //this creates a new moment instance that can be manipulated without changing the other
                    nextHour.add(1, 'hours').hours();
                    density[h] = density[h] + parseInt(moment.duration(nextHour.diff(startTime)).asMinutes());

                    //if the current hour is same hour as the sleep start hour and the wake time is in the same hour
                } else if (currentHour.isSame(startTime, 'hour') && wakeTime.isSame(startTime, 'hour')) {
                    nextHour = moment(currentHour); //this creates a new moment instance that can be manipulated without changing the other
                    nextHour.add(1, 'hours').hours();
                    density[h] = density[h] + parseInt(moment.duration(nextHour.diff(wakeTime)).asMinutes());

                    //if the current hour is after the sleep start hour but before the wake up hour
                } else if (currentHour.isBetween(startTime, wakeTime, 'hour')) {
                    density[h] = 60;

                    //if the current hour is same as the wake up hour
                } else if (currentHour.isSame(wakeTime, 'hour')) {
                    density[h] = parseInt(moment.duration(wakeTime.diff(moment(date + " " + hoursArray[h], 'MM/DD/YYYY hh:mm a'))).asMinutes());

                    //if the current hour is after the wake up hour
                } else if (currentHour.isAfter(wakeTime, 'hour')) {
                    //do nothing
                }

            }

        }

        console.log(date + ": " + density + '\n \n');
        return density;
    }

}

window.onload = function () {
    "use strict";
    //initializeC3Chart();
    //initializeLineChart();
    //initializeHeatmap();
    var tempArray, density;
    dateArray = getDates("05/01/17", "05/27/17", "MM.DD.YY");
    hoursArray = ['12 AM', '01 AM', '02 AM', '03 AM', '04 AM', '05 AM', '06 AM', '07 AM', '08 AM', '09 AM', '10 AM', '11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM', '06 PM', '07 PM', '08 PM', '09 PM', '10 PM', '11 PM'];

    $.ajax({
        url: "data/data.json",
        dataType: 'json',
        async: true,
        success: function (data) {
            jsonData = data;
            heatmapData = [];
            for (var dateIndex = 0; dateIndex < dateArray.length; dateIndex++) {
                density = getDensity(dateArray[dateIndex], "duration");
                for (var hourIndex = 0; hourIndex < hoursArray.length; hourIndex++) {
                    tempArray = [dateIndex, hourIndex, density[hourIndex]];
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
