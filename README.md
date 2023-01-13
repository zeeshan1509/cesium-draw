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
Set properties of drawn shape, we can set our own if we do not define it we use default values
```javascript
//point
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
	type: 'polyline',
	lineMaterial: '',
	polylineWidth: ''

})
```
For Start editing
```javascript
drawer.startEdit(entity,entityType)
```
For Finish editing
```javascript
drawer.finishEditing();
```