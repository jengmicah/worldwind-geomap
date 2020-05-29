import React, { useState, useEffect } from 'react';
import WorldWind from '@nasaworldwind/worldwind';
import AnnotationControls from '../AnnotationControls/AnnotationControls';

import targetData from "../../data/target.json";
import walmartData from "../../data/walmart.json";

import markerRed from './markers/marker-red.png';
import markerBlue from './markers/marker-blue.png';

import './Map.css';

const Map = ({ map, annotate, setAnnotate, toggledLayer }) => {
    const [wwd, setWwd] = useState(null);
    const [modal, setModal] = useState(false);
    const [currModal, setCurrModal] = useState(0);
    const [annotateObj, setAnnotateObj] = useState(null);
    const [annotatePos, setAnnotatePos] = useState({
        lat: 0,
        lng: 0
    });
    const [flatGlobe, setFlatGlobe] = useState(null);
    const [roundGlobe, setRoundGlobe] = useState(null);

    useEffect(() => {
        WorldWind.Logger.setLoggingLevel(WorldWind.Logger.LEVEL_NONE);
        WorldWind.configuration.baseUrl = "https://worldwind.netlify.app/";
        // Create a WorldWindow for the canvas.
        let wwdCanvas = new WorldWind.WorldWindow("globe");
        let roundGlobe = new WorldWind.Globe(new WorldWind.EarthElevationModel());
        let flatGlobe = new WorldWind.Globe2D();
        flatGlobe.projection = new WorldWind.ProjectionMercator();
        setFlatGlobe(flatGlobe);
        setRoundGlobe(roundGlobe);
        setWwd(wwdCanvas);
        // Add layers 
        addWorldWindLayers(wwdCanvas);
        // Add a placemark
        addPlacemark(wwdCanvas, walmartData, markerBlue, "Walmart");
        addPlacemark(wwdCanvas, targetData, markerRed, "Target");
        // Add listener for annotation editing
        handleAnnotationPicking(wwdCanvas);
    }, []);
    useEffect(() => {
        if (wwd != null) {
            if(map) wwd.globe = flatGlobe;
            else wwd.globe = roundGlobe;
        }
    }, [map, flatGlobe, roundGlobe, wwd]);
    useEffect(() => {
        // Toggle layer based on user input in <Controls />
        if (wwd != null)
            toggleLayer(wwd, toggledLayer);
    }, [toggledLayer, wwd]);

    useEffect(() => {
        if (wwd != null) {
            if (annotate)
                getAnnotationPos();
        }
    }, [annotate, wwd]);

    /**
     * Update annotation text
     * @param annotateText New annotation text
     */
    const updateAnnotationText = annotateText => {
        annotateObj.text = annotateText ? annotateText : annotateObj.text;
        wwd.redraw();
    }
    /**
     * Allow user to select area on map for annotation location
     * @param isNew Flag specifying if the current annotation is new
     */
    const getAnnotationPos = (isNew = true) => {
        let globe = document.querySelector('#globe');
        globe.style.cursor = "crosshair"
        let textLayer = new WorldWind.RenderableLayer("Text Layer");
        wwd.addLayer(textLayer);
        let textPlacement = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.95);
        let titleText = new WorldWind.ScreenText(textPlacement, "Select Annotation Location");
        textLayer.addRenderable(titleText);

        let titleAttributes = new WorldWind.TextAttributes();
        let textAlignment = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0.95);
        titleAttributes.offset = textAlignment;
        titleAttributes.font = new WorldWind.Font(26);
        titleText.attributes = titleAttributes;

        let handleClick = function (o) {
            const x = o.clientX,
                y = o.clientY;
            const pickList = wwd.pick(wwd.canvasCoordinates(x, y));
            let topPickedObject = pickList.topPickedObject();
            if (topPickedObject && topPickedObject.isTerrain) {
                const { latitude: lat, longitude: lng } = topPickedObject.position;
                setAnnotatePos({ lat, lng });
                wwd.removeEventListener("click", handleClick, false);
                wwd.removeLayer(textLayer);
                if (isNew) {
                    setCurrModal(1);
                    toggleModal();
                } else {
                    annotateObj.position.latitude = lat;
                    annotateObj.position.longitude = lng;
                }
                wwd.redraw();
                setAnnotate(false);
                globe.style.cursor = "default"
            }
        };
        wwd.addEventListener("click", handleClick);
        
        // Detect an escape to cancel
        document.onkeyup = e => {
            e = e || window.event;
            let isEscape = false;
            if ("key" in e) isEscape = (e.key === "Escape" || e.key === "Esc");
            else isEscape = (e.keyCode === 27);
            if (isEscape) {
                // Cancel action
                document.onkeyup = null;
                setAnnotate(false);
                globe.style.cursor = "default"
                wwd.removeLayer(textLayer);
                wwd.removeEventListener("click", handleClick, false);
            }
        };
    }
    /**
     * Creates annotation with user-specified text and position
     * @param text New annotation text
     */
    const addAnnotation = text => {
        // Set default annotation attributes.
        let annotationAttributes = new WorldWind.AnnotationAttributes(null);
        // annotationAttributes.cornerRadius = 14;
        annotationAttributes.backgroundColor = WorldWind.Color.BLACK;
        annotationAttributes.drawLeader = true;
        annotationAttributes.leaderGapWidth = 10;
        annotationAttributes.leaderGapHeight = 15;
        annotationAttributes.opacity = 1;
        annotationAttributes.scale = 1;
        annotationAttributes.width = 150;
        annotationAttributes.height = 100;
        annotationAttributes.textAttributes.color = WorldWind.Color.WHITE;
        annotationAttributes.insets = new WorldWind.Insets(8, 8, 2, 8);

        // Set a location for the annotation to point to and create it.
        let location = new WorldWind.Position(annotatePos.lat, annotatePos.lng, 1e2);
        let annotation = new WorldWind.Annotation(location, annotationAttributes);

        // Text can be assigned to the annotation after creating it.
        annotation.label = text;
        annotation.displayName = text;

        // Create and add the annotation layer to the WorldWindow's layer list.
        let annotationsLayer = new WorldWind.RenderableLayer("Annotations");
        annotationsLayer.addRenderable(annotation);
        wwd.addLayer(annotationsLayer);
        wwd.redraw();
    }
    /**
     * Handles start of annotation editing
     * @param wwd WorldWindow canvas
     */
    const handleAnnotationPicking = wwd => {
        let handleDblClick = function (o) {
            let x = o.clientX,
                y = o.clientY;
            // Convert from window coordinates to canvas coordinates
            let pickList = wwd.pick(wwd.canvasCoordinates(x, y));
            // Get top layer object
            let topPickedObject = pickList.topPickedObject();
            if (topPickedObject && !topPickedObject.isTerrain) {
                setCurrModal(0);
                toggleModal();
                setAnnotateObj(topPickedObject.userObject);
                wwd.redraw(); // redraw to make the highlighting changes take effect on the screen
            }
        };
        wwd.addEventListener("dblclick", handleDblClick);
    }
    /**
     * Toggles the enabled state of the given layer.
     * @param wwd WorldWindow canvas
     * @param toggledLayer Layer toggled by user
     */
    const toggleLayer = (wwd, toggledLayer) => {
        let layer = wwd.layers.find(x => x.displayName === toggledLayer.name);
        // If a layer is found
        if (layer !== undefined) {
            // Toggle the selected layer's visibility
            layer.enabled = toggledLayer.enabled;
            // Trigger a redraw so the globe shows the new layer state
            wwd.redraw();
        }
    }
    /**
     * Add layers to WorldWindow canvas
     * @param wwd WorldWindow canvas
     */
    const addWorldWindLayers = wwd => {
        // Create and add layers to the WorldWindow.
        let layers = [
            // Imagery layer
            { layer: new WorldWind.BMNGOneImageLayer(), enabled: true },
            { layer: new WorldWind.BingRoadsLayer(null), enabled: true },
            // Add atmosphere layer on top of all base layers
            { layer: new WorldWind.StarFieldLayer(), enabled: true },
            { layer: new WorldWind.AtmosphereLayer(), enabled: true },
            // WorldWindow UI layers
            { layer: new WorldWind.CoordinatesDisplayLayer(wwd), enabled: true },
            { layer: new WorldWind.ViewControlsLayer(wwd), enabled: true }
        ];

        for (let l = 0; l < layers.length; l++) {
            for (let key of Object.keys(layers[l])) {
                layers[l].layer[key] = layers[l][key];
            }
            wwd.addLayer(layers[l].layer);
        }
        wwd.redraw();
    }
    /**
     * Add placemark to WorldWindow canvas
     * @param wwd WorldWindow canvas
     */
    const addPlacemark = (wwd, dataset, marker, displayName) => {
        let placemark,
            placemarkAttributes = new WorldWind.PlacemarkAttributes(null),
            placemarkLayer = new WorldWind.RenderableLayer(displayName);

        // Set up the common placemark attributes.
        placemarkAttributes.imageOffset = new WorldWind.Offset(
            WorldWind.OFFSET_FRACTION, 0.3,
            WorldWind.OFFSET_FRACTION, 0.0
        );
        placemarkAttributes.imageSource = marker;
        // placemarkAttributes.labelAttributes.offset = new WorldWind.Offset(
        //     WorldWind.OFFSET_FRACTION, 0.5,
        //     WorldWind.OFFSET_FRACTION, 1.0
        // );

        for (let data of dataset) {
            // Create the placemark and its label.
            placemark = new WorldWind.Placemark(new WorldWind.Position(data.latitude, data.longitude, 0), true, null);
            // placemark.label = `(${placemark.position.latitude.toPrecision(4)}, ${placemark.position.longitude.toPrecision(5)})`;
            placemark.attributes = placemarkAttributes;
            // Add the placemark to the layer.
            placemarkLayer.addRenderable(placemark);
        }
        placemarkLayer.enabled = false;
        // Add the placemarks layer to the WorldWindow's layer list.
        wwd.addLayer(placemarkLayer);
    }
    /**
     * Toggle whether modal shows
     * @param modal Modal state
     */
    const toggleModal = () => setModal(!modal);

    return (
        <div className="fullscreen">
            <AnnotationControls
                modal={modal}
                currModal={currModal}
                annotateObj={annotateObj}
                toggleModal={toggleModal}
                setCurrModal={setCurrModal}
                addAnnotation={addAnnotation}
                getAnnotationPos={getAnnotationPos}
                updateAnnotationText={updateAnnotationText}
            />
            <canvas width="100%" height="100%" id="globe">
                Your browser does not support HTML5 Canvas.
            </canvas>
        </div>
    )
};

export default Map;