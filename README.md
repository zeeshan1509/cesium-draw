# cesium-draw-custom

Point,Polyline & Polygon Drawing Library

## install
```shell
npm install cesium-draw-custom
```

## usage
### javascript
```javascript
import cesiumDrawer from "cesium-draw-custom"


const drawer = new cesiumDrawer(viewer);

```
###set properties of drawn shape, we can set our own if we do not define it we use default values
```javascript
drawer.startDraw({
	type: 'point',
	color: '',
	billboard:'',
	pointSize:'',
	label: ''

})
//polygon
drawer.startDraw({
	type: 'polygon',
	material: '',
	outline:'',
	outlineColor: :,
	outlineWidth: '',
	fill: ''

})
//polyline
drawer.startDraw({
	type: 'polygon',
	lineMaterial: '',
	polylineWidth: ''

})
```
###For Start editing
```javascript
drawer.startEdit(entity,entityType)
```
###For Finish editing
```javascript
drawer.finishEditing();
```