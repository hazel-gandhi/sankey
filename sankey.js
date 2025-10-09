
const tooltip = d3.select(".tooltip");

console.log("Script loaded, tooltip:", tooltip);


function addInteractivity(artboardId, svgFileName) {
  console.log(`Loading ${svgFileName} into ${artboardId}...`);
  
  d3.xml(svgFileName).then(xml => {
    console.log(`✓ ${svgFileName} loaded successfully`);
    
    const artboard = document.getElementById(artboardId);
    
    
    const png = artboard.querySelector('img.g-aiImg');
    if (png && png.parentNode === artboard) {
        artboard.insertBefore(xml.documentElement, png); 
    } else {
        artboard.appendChild(xml.documentElement);
    }

    const svg = d3.select(`#${artboardId} svg`);

    
    svg.style("pointer-events", "auto");
    
    console.log(`SVG inserted into ${artboardId}`, svg.node());

    // log IDs and svg
    const allIds = [];
    svg.selectAll("[id]").each(function() {
      allIds.push(this.id);
    });
    console.log(`Found ${allIds.length} elements with IDs:`, allIds.slice(0, 10));

    // sankey data
    console.log("Loading sankey.csv...");
    d3.csv("sankey.csv").then(data => {
      console.log(`✓ CSV loaded with ${data.length} rows`, data[0]);

      let matchCount = 0;

      // tooltips
      data.forEach(d => {
        const selectorSource = d.SatState.trim().replace(/\s+/g, "_");
        const selectorTarget = d.LVState.trim().replace(/\s+/g, "_");

        
        const encodedLinkId = `${selectorSource}_${selectorTarget}`;

        
        const link = svg.select(`#${encodedLinkId}`);
        if (!link.empty()) {
          matchCount++;
          console.log(`✓ Matched link: ${encodedLinkId}`);
          
          link
            .style("cursor", "pointer")
            .style("pointer-events", "all")
            .attr("data-interactive", "true")
            .on("mouseover", function(event) {
              console.log("Mouse over:", encodedLinkId);
              d3.select(this).style("opacity", 0.7);
              tooltip
                .style("opacity", 1)
                .html(`<strong>${d.SatState} → ${d.LVState}</strong><br>${d.Count} launches`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
            })
            .on("mousemove", (event) => {
              tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", function() {
              d3.select(this).style("opacity", 1);
              tooltip.style("opacity", 0);
            });
        } else {
          console.log(`✗ No match for: ${encodedLinkId}`);
        }

        
        const node = svg.select(`#${selectorSource}`);
        if (!node.empty()) {
          matchCount++;
          console.log(`✓ Matched node: ${selectorSource}`);
          
          node
            .style("cursor", "pointer")
            .style("pointer-events", "all")
            .on("mouseover", function(event) {
              console.log("Mouse over node:", selectorSource);
              tooltip
                .style("opacity", 1)
                .html(`<strong>${d.SatState}</strong><br>${d.Count} launches`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
            })
            .on("mousemove", (event) => {
              tooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
            })
            .on("mouseout", () => {
              tooltip.style("opacity", 0);
            });
        }
      });

      console.log(`Total matches: ${matchCount}`);

    }).catch(err => {
      console.error(`✗ Error loading CSV for ${artboardId}:`, err);
    });
  }).catch(err => {
    console.error(`✗ Error loading ${svgFileName}:`, err);
  });
}

// make it interactive
addInteractivity('g-template-full', 'viz-full.svg');
addInteractivity('g-template-mobile', 'viz-mobile.svg');
