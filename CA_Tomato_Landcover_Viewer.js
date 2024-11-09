/*****************************************************
 * University of California, Davis - Digital Agriculture Laboratory
 * Developers: Alireza Pourreza, Mohammadreza Narimani
 *
 * Description:
 * The Tomato Landcover Visualization Portal operates within Google Earth Engine (GEE) to facilitate dynamic visualization and analysis of tomato crop distribution in California. Users can select different years to observe how tomato land cover changes across various counties in California.
 *
 * Key Functionalities Include:
 * 1. Interactive Mapping: Users can select the year to visualize tomato land cover distribution.
 * 2. County and State Boundaries: View tomato fields alongside county and state boundaries within California.
 * 3. Dynamic Legend and Information Panel: Updated legend and additional information displayed based on user selections.
 * 4. Beautiful UI Elements: Designed to provide a seamless user experience for researchers, educators, and policymakers.
 *
 * The app uses the Cropland Data Layer (CDL) dataset provided by USDA (United States Department of Agriculture) - National Agricultural Statistics Service.
 *
 * Visit our lab for more information: https://digitalag.ucdavis.edu/
 *****************************************************/

// Create a UI Panel to hold the dropdown and button
var panel = ui.Panel({
  style: { width: '400px', padding: '10px' }
});

// Create a label for the panel
var titleLabel = ui.Label('Select Year for Tomato Landcover Visualization',
  { fontWeight: 'bold', fontSize: '16px', margin: '0 0 10px 0' });
panel.add(titleLabel);

// Create a dropdown to select the year
var yearDropdown = ui.Select({
  items: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
  value: '2023', // Default year
  placeholder: 'Select a year',
  style: { margin: '0 0 10px 0' }
});
panel.add(yearDropdown);

// Create a button to show the result
var showButton = ui.Button({
  label: 'Show Result',
  onClick: updateMap,
  style: { margin: '5px 0 0 0' }
});
var instructionLabel = ui.Label('Click on this button to update the result', { fontWeight: 'bold', fontSize: '16px', margin: '0 0 10px 0' });
panel.add(instructionLabel);
panel.add(showButton);

// Add extra space after the button
panel.add(ui.Label('', { margin: '15px 0 0 0' }));

// Add the panel to the map
ui.root.insert(0, panel);

// Function to update the map based on the selected year
function updateMap() {
  // Clear all layers from the map
  Map.clear();

  // Get the selected year
  var selectedYear = yearDropdown.getValue();

  // Load the CDL dataset for the selected year
  var cdlDataset = ee.ImageCollection('USDA/NASS/CDL')
                    .filter(ee.Filter.date(selectedYear + '-01-01', selectedYear + '-12-31'))
                    .first();

  var cropLandcover = cdlDataset.select('cropland');
  var tomatoes = cropLandcover.eq(54); // Creates a mask for tomatoes

  var tomatoVisualization = {
    min: 0,
    max: 1,
    palette: ['FF0000'] // Red for tomatoes
  };

  var maskedTomatoes = tomatoes.updateMask(tomatoes);

  // Get California state boundary
  var states = ee.FeatureCollection('TIGER/2018/States');
  var california = states.filter(ee.Filter.eq('NAME', 'California'));

  // Clip the layers to California
  var tomatoesCalifornia = maskedTomatoes.clip(california);

  // Get California counties
  var counties = ee.FeatureCollection('TIGER/2018/Counties')
                  .filter(ee.Filter.eq('STATEFP', '06')); // '06' is the FIPS code for California

  // Define the style for the state and county boundaries
  var boundaryStyle = {
    color: '000000', 
    fillColor: '00000000', // Transparent fill
    width: 2 // Thicker lines for counties
  };
  var stateBoundaryStyle = {
    color: '000000',
    fillColor: '00000000',
    width: 4 // Thicker line for the state boundary
  };

  // Setting the center over Davis, California with a more focused zoom level
  Map.setCenter(-121.7415, 38.5449, 10); // Coordinates and zoom level for Davis, CA

  // Set Google Maps Hybrid as the base layer
  Map.setOptions('HYBRID');

  // Add the tomato land cover and boundary layers
  Map.addLayer(tomatoesCalifornia, tomatoVisualization, 'Tomato Landcover (' + selectedYear + ')');
  Map.addLayer(counties.style(boundaryStyle), {}, 'California Counties');
  Map.addLayer(california.style(stateBoundaryStyle), {}, 'California Boundary');

  // Add the legend to the panel on the left
  addLegendToPanel();
}

// Function to add a legend to the panel
function addLegendToPanel() {
  var legend = ui.Panel({
    style: {
      padding: '8px',
      backgroundColor: 'white',
      margin: '10px 0 0 0',
      width: '100%' // Ensures the legend aligns properly
    }
  });

  var legendTitle = ui.Label({
    value: 'Legend',
    style: { fontWeight: 'bold', fontSize: '16px', margin: '0 0 4px 0' }
  });
  legend.add(legendTitle);

  var tomatoLegend = ui.Panel({
    widgets: [
      ui.Label({
        value: 'Tomato',
        style: { fontWeight: 'bold', color: '000000', margin: '0 4px 4px 0' }
      }),
      ui.Label('', {
        backgroundColor: 'FF0000',
        margin: '0 0 4px 0',
        width: '30px',
        height: '15px'
      })
    ],
    layout: ui.Panel.Layout.flow('horizontal')
  });
  legend.add(tomatoLegend);

  panel.add(legend);
}

// Add additional description and credits to the panel
var description = ui.Label({
  value: 'This application visualizes the tomato land cover in California from 2015 to 2023.',
  style: { fontSize: '13px', margin: '10px 0', color: 'gray' }
});
var dataSource = ui.Label({
  value: 'Data is sourced from:',
  style: { fontSize: '13px', margin: '4px 0', color: 'gray' }
});
var bulletPoints = ui.Panel({
  widgets: [
    ui.Label({ value: '\u2022 CropScape', style: { fontSize: '13px', margin: '0 0 4px 10px', color: 'gray' } }),
    ui.Label({ value: '\u2022 Cropland Data Layer by USDA - National Agricultural Statistics Service', style: { fontSize: '13px', margin: '0 0 4px 10px', color: 'gray' } })
  ],
  layout: ui.Panel.Layout.flow('vertical')
});
var developers = ui.Label({
  value: 'Developers: Alireza Pourreza, Mohammadreza Narimani',
  style: { fontSize: '13px', fontWeight: 'bold', margin: '4px 0' }
});
var labInfo = ui.Label({
  value: 'Digital Agriculture Laboratory of the University of California, Davis',
  style: { fontSize: '13px', margin: '4px 0', color: 'gray' }
});
var link = ui.Label('Visit Digital Agriculture Lab', { fontSize: '13px', color: 'blue' });
link.setUrl('https://digitalag.ucdavis.edu/');

panel.add(description);
panel.add(dataSource);
panel.add(bulletPoints);
panel.add(developers);
panel.add(labInfo);
panel.add(link);

// Initial map setup for default year (2023)
updateMap();
