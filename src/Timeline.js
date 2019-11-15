import React, { useEffect } from "react";
import * as d3 from "d3";
import "./Timeline.css";

function Timeline() {
  useEffect(() => {
    buildTimeline();
  }, []);
  return (
    <>
      <div className="timelineDiv" />
    </>
  );
}

function buildTimeline() {
  var parseTime = d3.timeParse("%b %Y");
  d3.csv("experience.csv").then(function(data) {
    console.log(data);
    console.log("printing data");
    data.forEach(function(d) {
      d.lane = +d.lane;
      d.id = +d.id;
      d.start = parseTime(d.start);
      d.end = parseTime(d.end);
    });

    var lanes = ["Work", "Education", "Experience"];
    var laneLength = lanes.length;
    var timeBegin = d3.min(
      data.map(d => {
        return d.start;
      })
    );
    console.log(timeBegin);
    var timeEnd = d3.max(
      data.map(d => {
        return d.end;
      })
    );
    console.log(timeEnd);
    var margin = {
        top: 20,
        right: 15,
        bottom: 15,
        left: 120
      },
      w = 960 - margin.right - margin.left,
      h = 500 - margin.top - margin.bottom,
      miniHeight = laneLength * 12 + 50,
      mainHeight = h - miniHeight - 50;
    var x = d3
      .scaleTime()
      .domain([timeBegin, timeEnd])
      .range([0, w]);
    console.log("checking xscale on ", data[10], x(data[10].start));
    var x1 = d3.scaleTime().range([0, w]);
    var y1 = d3
      .scaleLinear()
      .domain([0, laneLength])
      .range([0, mainHeight]);
    var y2 = d3
      .scaleLinear()
      .domain([0, laneLength])
      .range([0, miniHeight]);
    var chart = d3
      .select(".timelineDiv")
      .append("svg")
      .attr("width", w + margin.right + margin.left)
      .attr("height", h + margin.top + margin.bottom)
      .attr("class", "chart");
    chart
      .append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", w)
      .attr("height", mainHeight);
    var main = chart
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .attr("width", w)
      .attr("height", mainHeight)
      .attr("class", "main");

    var mini = chart
      .append("g")
      .attr(
        "transform",
        "translate(" + margin.left + "," + (mainHeight + margin.top) + ")"
      )
      .attr("width", w)
      .attr("height", miniHeight)
      .attr("class", "mini");
    //main lanes and texts
    main
      .append("g")
      .selectAll(".laneLines")
      .data(data)
      .enter()
      .append("line")
      .attr("x1", margin.right)
      .attr("y1", function(d) {
        return y1(d.lane);
      })
      .attr("x2", w)
      .attr("y2", function(d) {
        return y1(d.lane);
      })
      .attr("stroke", "lightgray");
    main
      .append("g")
      .selectAll(".laneText")
      .data(lanes)
      .enter()
      .append("text")
      .text(function(d) {
        return d;
      })
      .attr("x", -margin.right)
      .attr("y", function(d, i) {
        return y1(i + 0.5);
      })
      .attr("dy", ".5ex")
      .attr("text-anchor", "end")
      .attr("class", "laneText");
    //mini lanes and texts
    mini
      .append("g")
      .selectAll(".laneLines")
      .data(data)
      .enter()
      .append("line")
      .attr("x1", margin.right)
      .attr("y1", function(d) {
        return y2(d.lane);
      })
      .attr("x2", w)
      .attr("y2", function(d) {
        return y2(d.lane);
      })
      .attr("stroke", "lightgray");

    mini
      .append("g")
      .selectAll(".laneText")
      .data(lanes)
      .enter()
      .append("text")
      .text(function(d) {
        return d;
      })
      .attr("x", -margin.right)
      .attr("y", function(d, i) {
        return y2(i + 0.5);
      })
      .attr("dy", ".5ex")
      .attr("text-anchor", "end")
      .attr("class", "laneText");

    var itemRects = main.append("g").attr("clip-path", "url(#clip)");

    //mini item rects
    mini
      .append("g")
      .selectAll("miniItems")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", function(d) {
        return "miniItem" + d.lane;
      })
      .attr("x", function(d) {
        return x(d.start);
      })
      .attr("y", function(d) {
        return y2(d.lane + 0.5) - 10;
      })
      .attr("width", function(d) {
        console.log(x(d.end) - x(d.start));
        return x(d.end) - x(d.start);
      })
      .attr("height", 20)
      .attr("rx", 3);
    //mini labels
    mini
      .append("g")
      .selectAll(".miniLabels")
      .data(data)
      .enter()
      .append("text")
      .text(function(d) {
        return d.id;
      })
      .attr("x", function(d) {
        return x(d.start);
      })
      .attr("y", function(d) {
        return y2(d.lane + 0.5);
      })
      .attr("dy", ".5ex");

    //brush
    var brush = d3
      .brushX()
      .extent([[x.range()[0], 0], [x.range()[1], miniHeight - 1]])
      .on("brush", display);

    mini
      .append("g")
      .attr("class", "x brush")
      .call(brush)
      .selectAll("rect")
      .attr("y", 1)
      .attr("height", miniHeight - 1);

    function display() {
      console.log("display called");
      if (!d3.event) return;
      if (!d3.event.sourceEvent) return; // Only transition after input.
      if (!d3.event.selection) return;
      console.log("hit after error checks");
      var rects,
        labels,
        minExtent = d3.event.selection.map(x.invert)[0]
          ? d3.event.selection.map(x.invert)[0]
          : 0,
        maxExtent = d3.event.selection.map(x.invert)[1]
          ? d3.event.selection.map(x.invert)[1]
          : 0,
        visItems = data.filter(function(d) {
          return d.start < maxExtent && d.end > minExtent;
        });
      console.log("rects", rects);
      x1.domain([minExtent, maxExtent]);
      //update main item rects
      rects = itemRects
        .selectAll("rect")
        .data(visItems, function(d) {
          return d.id;
        })
        .attr("x", function(d) {
          return x1(d.start);
        })
        .attr("width", function(d) {
          return x1(d.end) - x1(d.start);
        });
      rects
        .enter()
        .append("rect")
        .attr("class", function(d) {
          return "miniItem" + d.lane;
        })
        .attr("x", function(d) {
          return x1(d.start);
        })
        .attr("y", function(d) {
          return y1(d.lane) + 10;
        })
        .attr("width", function(d) {
          return x1(d.end) - x1(d.start);
        })
        .attr("height", function(d) {
          return 0.8 * y1(1);
        })
        .attr("rx", "9");
      rects.exit().remove();
      //update the item labels
      labels = itemRects
        .selectAll("text")
        .data(visItems, function(d) {
          return d.id;
        })
        .attr("x", function(d) {
          return x1(Math.max(d.start, minExtent) + 2);
        });
      labels
        .enter()
        .append("text")
        .text(function(d) {
          return d.title;
        })
        .attr("x", function(d) {
          return x1(Math.max(d.start, minExtent));
        })
        .attr("y", function(d) {
          return y1(d.lane + 0.5);
        })
        .attr("text-anchor", "start");
      labels.exit().remove();
    }
    display();
  });
}
export default Timeline;
