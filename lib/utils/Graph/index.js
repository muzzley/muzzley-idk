var d3 = require('d3');
var fs = require('fs');
var phantom = require('phantom');

var methods = {};

/*

axis data to set Graph

xName - name of x axis
xColor - array of colors. To gradient give an array with 4 indices, to one color give an array with one color.
y1Name - name of y1 axis
y1Color - array of colors. To gradient give an array with 4 indices, to one color give an array with one color.
y2Name - name of y2 axis
y2Color - array of colors. To gradient give an array with 4 indices, to one color give an array with one color.
xy1Data - array of values to first y axis [{x: data, y: 23}]
xy2Data - array of values to second y axis [{x: data, y: 23}]
maxMinValuesY1 - array of min and max values of first y axis (to the dot elements)
maxMinValuesY2 - array of min and max values of second y axis (to the dot elements)
path1Color - String of hexadecimal color
path2Color - String of hexadecimal color

circles data 

circle1Name - Name of first circle
circle1Value - Value of first circle
circle1Img - Image of first circle
circle1Color - Color of first circle (array like axis color)
circle2Name - Name of second circle
circle2Value - Value of second circle
circle2Img - Image of second circle
circle2Color - Color of second circle (array like axis color)
circle3Name - Name of third circle
circle3Value - Value of third circle
circle3Img - Image of third circle
circle3Color - Color of third circle (array like axis color)
*/

methods.buildGraph = function(options, callback){
  var xValues=[];
  var y1Values=[];
  var y2Values=[];

  //axisData.xy1Data
  options.axisData.xy1Data.forEach(function(value){
    xValues.push({x: value.x});
    y1Values.push({y: value.y});
  });

  //axisData.xy2Data
  options.axisData.xy2Data.forEach(function(value){
    xValues.push({x: value.x});
    y2Values.push({y: value.y});
  });

  options.axisData.xValues = xValues;
  options.axisData.y1Values = y1Values;
  options.axisData.y2Values = y2Values;

  var optionsG={
    axisData: options.axisData,
    circlesData: options.circlesData,
    background: options.background,
    path: options.path,
    nest: options.nestId,
    device: options.deviceId
  };
  methods.setGraph(optionsG, callback);
};

methods.setGraph = function(options, callback){
    
    var axisData = options.axisData;
    var y1Values = options.axisData.y1Values;
    var y2Values = options.axisData.y2Values;
    var xValues = options.axisData.xValues;
    d3.select('svg').remove();
    var margin = {top: 40, right: 20, bottom: 30, left: 30};
    var width = 640;
    var height = 320;
    var graphW = 440;
    var graphH = 240;
    var padding = 5;
    var xFunction =function(d) { return d.x; };
    var y1Function = function(d) { return d.y; };
    var y2Function = function(d){ return d.y; };

    var x = d3.time.scale().range([padding, graphW-padding]);
    var y1 = d3.scale.linear().range([graphH-padding, padding]);
    var y2 = d3.scale.linear().range([graphH-padding, padding]);
    var ticksNr = 0;
    if(xValues.length > 6){
      ticksNr = 6;
    }else{
      ticksNr = xValues.length;
    }
    var xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(ticksNr).tickSize(2,0);
    var y1Axis = d3.svg.axis().scale(y1).orient('left').ticks(6).tickSize(0,2);
    var y2Axis = d3.svg.axis().scale(y2).orient('right').ticks(6).tickSize(0,2);

    var line1 = d3.svg.line().x(function(data) { return x(data.x); }).y(function(data) { return y1(data.y); }).interpolate('linear');
    var line2 = d3.svg.line().x(function(data) { return x(data.x); }).y(function(data) { return y2(data.y); }).interpolate('linear');
 
    var graphsvg = d3.select('body')
       .append('svg')
        .attr('id', 'svg')
        .attr('width', (width-margin.left) )
        .attr('height', (height-margin.bottom))
       .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.bottom + ')');

    var y1Min = d3.min(y1Values, y1Function);
    var y1Max = d3.max(y1Values, y1Function);
    var y2Min = d3.min(y2Values, y2Function);
    var y2Max = d3.max(y2Values, y2Function);

    x.domain([d3.min(xValues, xFunction), d3.max(xValues, xFunction)]);
    y1.domain([y1Min, y1Max]);
    y2.domain([y2Min, y2Max]);

    var styleColorX='';
    var styleColorY1='';
    var styleColorY2='';
    var colorCircle1='';
    var colorCircle2='';
    var colorCircle3='';
    var circlesData = options.circlesData;
    var colorData = {
      xColor: axisData.xColor,
      y1Color: axisData.y1Color,
      y2Color: axisData.y2Color,
      circle1Color: circlesData.circle1Color,
      circle2Color: circlesData.circle2Color,
      circle3Color: circlesData.circle3Color
    };
    methods.makeGradients(graphsvg, colorData, function(colors){
      styleColorX = colors.colorX;
      styleColorY1 = colors.colorY1;
      styleColorY2 = colors.colorY2;
      colorCircle1 = colors.colorCircle1;
      colorCircle2 = colors.colorCircle2;
      colorCircle3 = colors.colorCircle3;
    });
  

    graphsvg.append('g')
        .attr('class', 'xaxis')
        .style('stroke', styleColorX)
        .attr('transform', 'translate(0,' + graphH + ')')
        .call(xAxis)
        .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dy', '15px');

    graphsvg.append('g')
        .attr('class', 'y1axis')
        .style('stroke', styleColorY1)
        .call(y1Axis)
      .append('text')
        .attr('dy', '-15px')
        .attr('dx', '15px')
        .attr('class', 'subtitle')
        .style('text-anchor', 'start')
        .text(axisData.y1Name);

    graphsvg.selectAll('line.y1')
      .data(y1.ticks(6))
      .enter().append('line')
      .attr('class', 'guide')
      .attr('x1', padding)
      .attr('x2', (graphW-padding))
      .attr('y1', y1)
      .attr('y2', y1)
      .style('stroke', '#ccc').style('opacity', '0.5');
    graphsvg.append('path')
        .attr('d', line1(axisData.xy1Data))
        .attr('class', 'line')
        .style('stroke', axisData.path1Color)
        .attr('stroke-width', 3)
        .attr('fill', 'none');

    if(axisData.maxMinValuesY1 && axisData.maxMinValuesY1.length > 0){
      graphsvg.selectAll('.dot')
      .data(axisData.maxMinValuesY1).enter().append('circle')
          .attr('class', 'dot').attr('r', 8)
          .style('stroke', axisData.path1Color)
          .attr('cy', function(d) { return y1(d.y); })
          .attr('cx', function(d) { return x(d.x); });
    }

    if(axisData.y2Name !== ''){
      graphsvg.append('g')
        .attr('class', 'y2axis')
        .style('stroke', styleColorY2)
        .attr('transform', 'translate(' + graphW + ' ,0)')
        .call(y2Axis)
      .append('text')
        .attr('dy', '-15px')
        .attr('dx', '-10px')
        .attr('class', 'subtitle')
        .style('text-anchor', 'end')
        .text(axisData.y2Name);
      graphsvg.append('path')
        .attr('d', line2(axisData.xy2Data))
        .attr('class', 'line')
        .style('stroke', axisData.path2Color)
        .attr('stroke-width', 3)
        .attr('fill', 'none');

      if(axisData.maxMinValuesY2 && axisData.maxMinValuesY2.length > 0){
        graphsvg.selectAll('.dot')
        .data(axisData.maxMinValuesY2).enter().append('circle')
            .attr('class', 'dot').attr('r', 8)
            .style('stroke', axisData.path2Color)
            .attr('cy', function(d) { return y2(d.y); })
            .attr('cx', function(d) { return x(d.x); });
      }
    }

    var yValue = 20;
    // circle 1
    if(circlesData.circle1Value !== ''){
      graphsvg.append('circle')
          .attr('class', 'circle1')
          .attr('r', 40)
          .attr('cy', yValue)
          .attr('cx', (graphW + 90))
          .style('stroke', colorCircle1);
      if(circlesData.circle1Img !== ''){ //format with image
        graphsvg.append('text')
          .attr('dy', yValue+20)
          .attr('dx', (graphW + 90))
          .attr('class', 'hightlightType')
          .text(circlesData.circle1Value.toString());
        graphsvg.append('img')
          .attr('class', 'circleImg').style('margin-top', yValue)
          .attr('src', 'data:image/png;base64,'+circlesData.circle1Img)
          .attr('width', 35).attr('height', 35);
      }else{ //format without image
        graphsvg.append('text')
          .attr('dy', yValue)
          .attr('dx', (graphW + 90))
          .attr('class', 'hightlightValue')
          .text(circlesData.circle1Value);
        graphsvg.append('text')
          .attr('dy', yValue+20)
          .attr('dx', (graphW + 90))
          .attr('class', 'hightlightType')
          .text(circlesData.circle1Name);
      }
      yValue = yValue + 100;
    }
    // circle 2
    if(circlesData.circle2Value !== ''){
      graphsvg.append('circle')
        .attr('class', 'circle2')
        .attr('r', 40)
        .attr('cy', yValue)
        .attr('cx', (graphW + 90))
        .style('stroke', colorCircle2);
      if(circlesData.circle2Img !== ''){ //format with image
        graphsvg.append('text')
          .attr('dy', yValue+20)
          .attr('dx', (graphW + 90))
          .attr('class', 'hightlightType')
          .text(circlesData.circle2Value.toString());
        graphsvg.append('img')
          .attr('class', 'circleImg').style('margin-top', yValue)
          .attr('src', 'data:image/png;base64,'+circlesData.circle2Img)
          .attr('width', 35).attr('height', 35);
      }else{ //format without image
        graphsvg.append('text')
          .attr('dy', yValue)
          .attr('dx', (graphW + 90))
          .attr('class', 'hightlightValue')
          .text(circlesData.circle2Value);
        graphsvg.append('text')
          .attr('dy', yValue+20)
          .attr('dx', (graphW + 90))
          .attr('class', 'hightlightType')
          .text(circlesData.circle2Name);
      }
      yValue = yValue + 100;
    }
    // circle 3
    if(circlesData.circle3Value !== ''){
      graphsvg.append('circle')
        .attr('class', 'circle3')
        .attr('r', 40)
        .attr('cy', yValue)
        .attr('cx', (graphW + 90))
        .style('stroke', colorCircle3);
      if(circlesData.circle3Img !== ''){ //format with image
        graphsvg.append('text')
          .attr('dy', yValue+20)
          .attr('dx', (graphW + 90))
          .attr('class', 'hightlightType')
          .text(circlesData.circle3Value.toString());
        graphsvg.append('img')
          .attr('class', 'circleImg').style('margin-top', yValue)
          .attr('src', 'data:image/png;base64,'+circlesData.circle3Img)
          .attr('width', 35).attr('height', 35);
      }else{ //format without image
        graphsvg.append('text')
          .attr('dy', yValue)
          .attr('dx', (graphW + 90))
          .attr('class', 'hightlightValue')
          .text(circlesData.circle3Value);
        graphsvg.append('text')
          .attr('dy', yValue+20)
          .attr('dx', (graphW + 90))
          .attr('class', 'hightlightType')
          .text(circlesData.circle3Name);
      }
    }

    fs.readFile(__dirname+'/graph.css', function(error, content){
      if(error){
        console.log(error);
      }
      else{
        d3.select('body').append('style').html( 'html{ background : #fff url(data:image/png;base64,'+options.background+')}}' );
        d3.select('body').append('style').html( content );
        //var html = '<html>' + d3.select('html').html() + '</html>';
        var document;
        phantom.create(function (ph) {
          ph.createPage(function (page) {
            page.open('about:blank', function (status) {
              if (status !== 'success') {
                  console.log('Unable to load the address!');
              }else {
                page.evaluate(function (content) {
                  document.body.innerHTML = content;
                }, function () {
                    var filename = 'graph_'+options.device+'.jpg';
                    var path = options.path+filename;
                    page.render('.'+path, {format: 'jpg', quality: '70', width: 640, height: 320});
                    ph.exit();
                    setTimeout(function () {
                        if(callback){
                          callback('success', path, filename);
                        }
                    }, 200);
                    
                }, d3.select('body').html());

              }
            });
          });
        });
      }
    });
};

methods.makeGradients = function(svg, dataColors, callbaclk){
  var styleColorX='';
  var styleColorY1='';
  var styleColorY2='';
  var circle1Color='';
  var circle2Color='';
  var circle3Color='';
  var offsetValues = ['0%', '60%', '80%', '100%'];

  if(dataColors.xColor){
    if(dataColors.xColor.length > 1){
      var colorX = svg.append('svg:defs').append('svg:linearGradient').attr('id', 'xAxisColor').attr('x1','0').attr('x2','0').attr('y1','0').attr('y2','1');
      dataColors.xColor.forEach( function(value, index){
        colorX.append('svg:stop').attr('offset', offsetValues[index]).attr('stop-color', dataColors.xColor[index]).attr('stop-opacity', 1);
      });
      styleColorX = 'url("#xAxisColor")';
    }else{
      styleColorX = dataColors.xColor[0];
    }
  }

  if(dataColors.y1Color){
    if(dataColors.y1Color.length > 1){
      var colorY1 = svg.append('svg:defs').append('svg:linearGradient').attr('id', 'y1AxisColor').attr('x1','0').attr('x2','0').attr('y1','0').attr('y2','1');
      dataColors.y1Color.forEach( function(value, index){
        colorY1.append('svg:stop').attr('offset', offsetValues[index]).attr('stop-color', dataColors.y1Color[index]).attr('stop-opacity', 1);
      });
      styleColorY1 = 'url("#y1AxisColor")';
    }else{
      styleColorY1 = dataColors.y1Color[0];
    }
  }

  if(dataColors.y2Color){
    if(dataColors.y2Color.length > 1){
      var colorY2 = svg.append('svg:defs').append('svg:linearGradient').attr('id', 'y2AxisColor').attr('x1','0').attr('x2','0').attr('y1','0').attr('y2','1');
      dataColors.y2Color.forEach( function(value, index){
        colorY2.append('svg:stop').attr('offset', offsetValues[index]).attr('stop-color', dataColors.y2Color[index]).attr('stop-opacity', 1);
      });
      styleColorY2 = 'url("#y2AxisColor")';
    }else{
      styleColorY2 = dataColors.y2Color[0];
    }
  }

  if(dataColors.circle1Color){
    if(dataColors.circle1Color.length > 1){
      var circle1 = svg.append('svg:defs').append('svg:linearGradient').attr('id', 'circle1Color').attr('x1','0').attr('x2','0').attr('y1','0').attr('y2','1');
      dataColors.circle1Color.forEach( function(value, index){
        circle1.append('svg:stop').attr('offset', offsetValues[index]).attr('stop-color', dataColors.circle1Color[index]).attr('stop-opacity', 1);
      });
      circle1Color = 'url("#circle1Color")';
    }else{
      circle1Color = dataColors.circle1Color[0];
    }
  }

  if(dataColors.circle2Color){
    if(dataColors.circle2Color.length > 1){
      var circle2 = svg.append('svg:defs').append('svg:linearGradient').attr('id', 'circle2Color').attr('x1','0').attr('x2','0').attr('y1','0').attr('y2','1');
      dataColors.circle2Color.forEach( function(value, index){
        circle2.append('svg:stop').attr('offset', offsetValues[index]).attr('stop-color', dataColors.circle2Color[index]).attr('stop-opacity', 1);
      });
      circle2Color = 'url("#circle2Color")';
    }else{
      circle2Color = dataColors.circle2Color[0];
    }
  }
  if(dataColors.circle3Color){
    if(dataColors.circle3Color.length > 1){
      var circle3 = svg.append('svg:defs').append('svg:linearGradient').attr('id', 'circle3Color').attr('x1','0').attr('x2','0').attr('y1','0').attr('y2','1');
      dataColors.circle1Color.forEach( function(value, index){
        circle3.append('svg:stop').attr('offset', offsetValues[index]).attr('stop-color', dataColors.circle1Color[index]).attr('stop-opacity', 1);
      });
      circle3Color = 'url("#circle3Color")';
    }else{
      circle3Color = dataColors.circle3Color[0];
    }
  }
  
  callbaclk({
    colorX: styleColorX,
    colorY1: styleColorY1,
    colorY2: styleColorY2,
    colorCircle1: circle1Color,
    colorCircle2: circle2Color,
    colorCircle3: circle3Color
  });
};


module.exports = methods;
