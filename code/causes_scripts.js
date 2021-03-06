var margin = {left:150, top:40, right:120, bottom:150},
    width = Math.max( Math.min(window.innerWidth, 1100) - margin.left - margin.right - 20, 600),
    height = Math.max( Math.min(window.innerHeight - 250, 800) - margin.top - margin.bottom - 20, 500),
    innerRadius = Math.min(width * 0.43, height * .50),
    outerRadius = innerRadius * 1.05;
    
//Recalculate the width and height now that we know the radius
width = outerRadius * 2 + margin.right + margin.left;
height = outerRadius * 2 + margin.top + margin.bottom;
    
//Reset the overall font size
var newFontSize = Math.min(70, Math.max(40, innerRadius * 62.5 / 250));
d3.select("html").style("font-size", newFontSize + "%");

////////////////////////////////////////////////////////////
////////////////// Set-up Chord parameters /////////////////
////////////////////////////////////////////////////////////
    
var pullOutSize = 20 + 30/135 * innerRadius;
var numFormat = d3.format(",.0f");
var defaultOpacity = 0.85,
    fadeOpacity = 0.075;
                        
var loom = d3.loom()
    .padAngle(0.05)
    //.sortSubgroups(sortAlpha)
    //.heightInner(28)
    .emptyPerc(0.2)
    .widthInner(30)
    //.widthInner(function(d) { return 6 * d.length; })
    .value(function(d) { return d.Total; })
    .inner(function(d) { return d.State; })
    .outer(function(d) { return d.Type; });

var arc = d3.arc()
    .innerRadius(innerRadius*1.01)
    .outerRadius(outerRadius);

var string = d3.string()
    .radius(innerRadius)
    .pullout(pullOutSize);

////////////////////////////////////////////////////////////
//////////////////// Character notes ///////////////////////
////////////////////////////////////////////////////////////
    
var characterNotes = [];
//28 states cange
characterNotes["Maharashtra"] = "Maximum number of suicides happening due to Drug Abuse/Addiction in India are from Maharashtra";
characterNotes["Andhra Pradesh"] = "Maximum number of suicides happening due to poverty in India are from Andhra";
characterNotes["Tamil Nadu"] = "Maximum number of suicides happening due to family problems in India are from Tamil Nadu";
characterNotes["Karnataka"] = "Mental illness and other prolonged illness are major concerns in Karnataka apart from family problems";
characterNotes["Madhya Pradesh"] = "Maximum number of suicides happening due to Dowry Disputes in India are from Madhya Pradesh";


////////////////////////////////////////////////////////////
////////////////////// Create SVG //////////////////////////
////////////////////////////////////////////////////////////
            
var svg = d3.select("#lotr-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

////////////////////////////////////////////////////////////
///////////////////// Read in data /////////////////////////
////////////////////////////////////////////////////////////
            
d3.json('causes.json', function (error, dataAgg) {

    ////////////////////////////////////////////////////////////
    ///////////////////// Prepare the data /////////////////////
    ////////////////////////////////////////////////////////////
    
    //Sort the inner characters based on the total number of  spoken
    
    //Find the total number of words per character
    var dataChar = d3.nest()
        .key(function(d) { return d.State; })
        .rollup(function(leaves) { return d3.sum(leaves, function(d) { return d.Total; }); })
        .entries(dataAgg)
        .sort(function(a, b){ return d3.descending(a.value, b.value); });               
    //Unflatten the result
    var characterOrder = dataChar.map(function(d) { return d.key; });
    //Sort the characters on a specific order
    function sortCharacter(a, b) {
        return characterOrder.indexOf(a) - characterOrder.indexOf(b);
    }//sortCharacter
    
    //Set more loom functions
    loom
        .sortSubgroups(sortCharacter)
        .heightInner(innerRadius*1.4/characterOrder.length);
    
    ////////////////////////////////////////////////////////////
    ///////////////////////// Colors ///////////////////////////
    ////////////////////////////////////////////////////////////
                    
    //Color for the unique locations
    var Types = ['Bankruptcy', 'Cancellation of Marriage', 'Cancer', 'Career Problem',
 'Death of Dear Person', 'Divorce' ,'Dowry Dispute', 'Drug Addiction',
 'Failure in Examination','Fall in Social Reputation', 'Family Problems',
 'Hero Worshipping', 'Illegitimate Pregnancy', 'Illicit Relation',
 'Illness (Aids/STD)' ,'Love Affairs' ,'Mental Illness', 'Not having Children',
 'Paralysis', 'Physical Abuse' ,'Poverty', 'Prolonged Illness',
 'Property Dispute' ,'Unemployment']

    var locations = ["Bree", "Emyn Muil", "Fangorn", "Gondor",  "Isengard", "Lothlorien", "Misty Mountains", "Mordor",  "Moria",   "Parth Galen", "Rivendell", "Rohan",   "The Shire"];
    var colors = ["#5a3511", "#47635f",   "#223e15", "#C6CAC9", "#0d1e25",  "#53821a",    "#4387AA",         "#770000", "#373F41", "#602317", "#BF6001",   "#c17924", "#3C7E16", "#5a3511", "#47635f",   "#223e15", "#dd2660", "#0d1e25",  "#53821a",    "#4387AA",         "#770000", "#373F41", "#602317", "#8D9413"]
    //,     "#8D9413",   "#c17924", "#3C7E16"];
    var color = d3.scaleOrdinal()
        .domain(Types)
        .range(colors);
    
    //Create a group that already holds the data
    var g = svg.append("g")
        .attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")")
        .datum(loom(dataAgg));  

    ////////////////////////////////////////////////////////////
    ///////////////////// Set-up title /////////////////////////
    ////////////////////////////////////////////////////////////

    var titles = g.append("g")
        .attr("class", "texts")
        .style("opacity", 0);
        
    titles.append("text")
        .attr("class", "name-title")
        .attr("x", 0)
        .attr("y", -innerRadius*5/6 -4);
        
    titles.append("text")
        .attr("class", "value-title")
        .attr("x", 0)
        .attr("y", -innerRadius*5/6 + 15);
    
    //The character pieces  
    titles.append("text")
        .attr("class", "character-note")
        .attr("x", 0)
        .attr("y", innerRadius)//by 2 earlier
        .attr("dy", "0.35em");
                    
    ////////////////////////////////////////////////////////////
    ////////////////////// Draw outer arcs /////////////////////
    ////////////////////////////////////////////////////////////

    var arcs = g.append("g")
        .attr("class", "arcs")
      .selectAll("g")
        .data(function(s) { 
            return s.groups; 
        })
      .enter().append("g")
        .attr("class", "arc-wrapper")
        .each(function(d) { 
            d.pullOutSize = (pullOutSize * ( d.startAngle > Math.PI + 1e-2 ? -1 : 1)) 
        })
        .on("mouseover", function(d) {
            
            //Hide all other arcs   
            d3.selectAll(".arc-wrapper")
                .transition()
                .style("opacity", function(s) { return s.outername === d.outername ? 1 : 0.5; });
            
            //Hide all other strings
            d3.selectAll(".string")
                .transition()
                .style("opacity", function(s) { return s.outer.outername === d.outername ? 1 : fadeOpacity; });
                
            //Find the data for the strings of the hovered over location
            var locationData = loom(dataAgg).filter(function(s) { return s.outer.outername === d.outername; });
            //Hide the characters who haven't said a word
            d3.selectAll(".inner-label")
                .transition()
                .style("opacity", function(s) {
                    //Find out how many words the character said at the hovered over location
                    var char = locationData.filter(function(c) { return c.outer.innername === s.name; });
                    return char.length === 0 ? 0.1 : 1;
                });
        })
        .on("mouseout", function(d) {
            
            //Sjow all arc labels
            d3.selectAll(".arc-wrapper")
                .transition()
                .style("opacity", 1);
            
            //Show all strings again
            d3.selectAll(".string")
                .transition()
                .style("opacity", defaultOpacity);
                
            //Show all characters again
            d3.selectAll(".inner-label")
                .transition()
                .style("opacity", 1);
        });

    var outerArcs = arcs.append("path")
        .attr("class", "arc")
        .style("fill", function(d) { return color(d.outername); })
        .attr("d", arc)
        .attr("transform", function(d, i) { //Pull the two slices apart
            return "translate(" + d.pullOutSize + ',' + 0 + ")";
         });
                            
    ////////////////////////////////////////////////////////////
    //////////////////// Draw outer labels /////////////////////
    ////////////////////////////////////////////////////////////

    //The text needs to be rotated with the offset in the clockwise direction
    var outerLabels = arcs.append("g")
        .each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2); })
        .attr("class", "outer-labels")
        .attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
        .attr("transform", function(d,i) { 
            var c = arc.centroid(d);
            return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
            + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
            + "translate(" + 26 + ",0)"
            + (d.angle > Math.PI ? "rotate(180)" : "")
        })
        
    //The outer name
    outerLabels.append("text")
        .attr("class", "outer-label")
        .attr("dy", ".35em")
        .text(function(d,i){ return d.outername; });
        
    //The value below it
    outerLabels.append("text")
        .attr("class", "outer-label-value")
        .attr("dy", "1.5em")
        .text(function(d,i){ return numFormat(d.value) + " suicides"; });

    ////////////////////////////////////////////////////////////
    ////////////////// Draw inner strings //////////////////////
    ////////////////////////////////////////////////////////////
    
    var strings = g.append("g")
        .attr("class", "stringWrapper")
        .style("isolation", "isolate")
      .selectAll("path")
        .data(function(strings) { 
            return strings; 
        })
      .enter().append("path")
        .attr("class", "string")
        .style("mix-blend-mode", "multiply")
        .attr("d", string)
        .style("fill", function(d) { return d3.rgb( color(d.outer.outername) ).brighter(0.2) ; })
        .style("opacity", defaultOpacity);
        
    ////////////////////////////////////////////////////////////
    //////////////////// Draw inner labels /////////////////////
    ////////////////////////////////////////////////////////////
            
    //The text also needs to be displaced in the horizontal directions
    //And also rotated with the offset in the clockwise direction
    var innerLabels = g.append("g")
        .attr("class","inner-labels")
      .selectAll("text")
        .data(function(s) { 
            return s.innergroups; 
        })
      .enter().append("text")
        .attr("class", "inner-label")
        .attr("x", function(d,i) { return d.x; })
        .attr("y", function(d,i) { return d.y; })
        .style("text-anchor", "middle")
        .attr("dy", ".35em")
        .text(function(d,i) { return d.name; })
        .on("mouseover", function(d) {
            
            //Show all the strings of the highlighted character and hide all else
            d3.selectAll(".string")
                .transition()
                .style("opacity", function(s) {
                    return s.outer.innername !== d.name ? fadeOpacity : 1;
                });
                
            //Update the word count of the outer labels
            var characterData = loom(dataAgg).filter(function(s) { return s.outer.innername === d.name; });
            d3.selectAll(".outer-label-value")
                .text(function(s,i){
                    //Find which characterData is the correct one based on location
                    var loc = characterData.filter(function(c) { return c.outer.outername === s.outername; });
                    if(loc.length === 0) {
                        var value = 0;
                    } else {
                        var value = loc[0].outer.value;
                    }
                    return numFormat(value) + (value === 1 ? " suicide" : " suicides"); 
                    
                });
            
            //Hide the arc where the character hasn't said a thing
            d3.selectAll(".arc-wrapper")
                .transition()
                .style("opacity", function(s) {
                    //Find which characterData is the correct one based on location
                    var loc = characterData.filter(function(c) { return c.outer.outername === s.outername; });
                    return loc.length === 0 ? 0.1 : 1;
                });
                    
            //Update the title to show the total word count of the character
            d3.selectAll(".texts")
                .transition()
                .style("opacity", 1);   
            d3.select(".name-title")
                .text(d.name);
            d3.select(".value-title")
                .text(function() {
                    var words = dataChar.filter(function(s) { return s.key === d.name; });
                    return numFormat(words[0].value);
                });
                
            //Show the character note
            d3.selectAll(".character-note")
                .text(characterNotes[d.name])
                .call(wrap, 2.25*pullOutSize);
                
        })
        .on("mouseout", function(d) {
            
            //Put the string opacity back to normal
            d3.selectAll(".string")
                .transition()
                .style("opacity", defaultOpacity);
                
            //Return the word count to what it was
            d3.selectAll(".outer-label-value")  
                .text(function(s,i){ return numFormat(s.value) + " suicides"; });
                
            //Show all arcs again
            d3.selectAll(".arc-wrapper")
                .transition()
                .style("opacity", 1);
            
            //Hide the title
            d3.selectAll(".texts")
                .transition()
                .style("opacity", 0);
            
        });
            
});//d3.csv

////////////////////////////////////////////////////////////
///////////////////// Extra functions //////////////////////
////////////////////////////////////////////////////////////

//Sort alphabetically
function sortAlpha(a, b){
        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
}//sortAlpha

//Sort on the number of words
function sortWords(a, b){
        if(a.Total < b.Total) return -1;
        if(a.Total > b.Total) return 1;
        return 0;
}//sortWords

/*Taken from http://bl.ocks.org/mbostock/7555321
//Wraps SVG text*/
function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.2, // ems
        y = parseFloat(text.attr("y")),
        x = parseFloat(text.attr("x")),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}//wrap
