import * as Cesium from 'cesium';

/* eslint-disable no-dupe-class-members */
/**
 *Distinguish the type of cesium entity, and judge whether the entity is registered in draw, and return the entity type if it has been registered
 * @param {Cesium.Entity} entity
 * @param {CesiumDrawer} drawer
 * @returns {EntityType} entity type
 */
function diffEntityType(entity, drawer) {
    let K;
    const keys = Object.keys(drawer.classMap);
    for (const key of keys) {
        const ES = drawer.classMap[key].entities;
        const E = ES && ES.find((item) => item.id === entity.id);
        if (E) {
            K = key;
            break;
        }
    }
    return K;
}
/**
 * cartesian2 change into cartesian3
 * @param {Cesium.Cartesian2} cartesian2
 * @param {Cesium.Viewer} viewer
 * @returns {Cesium.Cartesian3}
 */
const Car2ToCar3 = function (cartesian2, viewer) {
    // 2d Mode to convert screen coordinates to Cartesian 3D coordinates
    if (viewer.scene.mode === Cesium.SceneMode.SCENE2D) {
        return viewer.camera.pickEllipsoid(cartesian2, viewer.scene.globe.ellipsoid);
    }
    // 3d In the mode, the screen coordinates are converted to 3D coordinates, considering the terrain
    if (viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
        const Ray = viewer.camera.getPickRay(cartesian2);
        return viewer.scene.globe.pick(Ray, viewer.scene);
    }
};
/**
 * cartesian3 Convert to latitude and longitude height
 * @param {Cesium.Cartesian3} car3
 * @param {Cesium.Viewer} viewer
 * @returns  latitude and longitude
 */
const Car3toDegrees = function (car3, viewer) {
    const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(car3);
    const latitude = Cesium.Math.toDegrees(cartographic.latitude);
    const longitude = Cesium.Math.toDegrees(cartographic.longitude);
    const { height } = cartographic;
    return {
        latitude,
        longitude,
        height,
    };
};
/**
 * get midpoint
 * @param {Cesium.Cartesian3} m starting point
 * @param {Cesium.Cartesian3} n end
 * @returns {Cesium.Cartesian3}
 */
const computeMiddlePoint = function (m, n) {
    const x = (m.x + n.x) / 2;
    const y = (m.y + n.y) / 2;
    const z = (m.z + n.z) / 2;
    return {
        x,
        y,
        z,
    };
};
/**
 * end point increase

 * @param viewer map instance
 * @param option configuration parameters
 * @returns entity
 * @description Point entities added by directly calling this method will not be maintained in the point queue, nor can they be vector edited

 */




const addPoint = function (viewer, option) {
    // const defaultPoint = new Cesium.PointGraphics({
    //     show: true,
    //     pixelSize: 8,
    //     color: Cesium.Color.RED,
    //     outlineColor: Cesium.Color.WHITE,
    //     outlineWidth: 2,
    //     //Turn off the depth detection of points to prevent being blocked by elevation
    //     // disableDepthTestDistance: Number.MAX_SAFE_INTEGER,
    //     // Altitude reference, always stick to the ground in 3D, and close in 2D.
    //     heightReference: viewer.scene.mode === Cesium.SceneMode.SCENE3D
    //         ? Cesium.HeightReference.CLAMP_TO_GROUND
    //         : Cesium.HeightReference.NONE,
    // });
    // if (option.point instanceof Cesium.PointGraphics) {
    //     option.point.merge(defaultPoint);
    // }
    // else {
    //     option.point = new Cesium.PointGraphics(option.point);
    //     option.point.merge(defaultPoint);
    // }
    // const url = Cesium.buildModuleUrl("https://upload.wikimedia.org/wikipedia/commons/0/00/Simpleicons_Places_map-marker-point.svg");
   
    // const showOption = option.showMidPointMarker;
    // console.log("opt",showOption)
    // const billboardDefault = {
    //     image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gEXFB8WNu8hCgAAANFJREFUSMe1lV0NxCAQhCdnoBKQUAmcg6sDJCABCScBKUiohJ4DJNAXmlw2S8vyM8m+0Ha+hW6nwL0UAA/gAJD+KgAw6JQhplwFAMss86t2KUQJzK/yEoBnDI68K124nnJjVYrUPBEBsAzA1gLogyYxYibLcWavCuBPuC4GbIX1d+v8h6djyqNJ79G938Ce4bEwZdVaCiZ3ZaXH5ATmsSUuJLtwrS/bzepekknf3sj2DwDVC1CjErRlF2oUYJ3ZfSk+1tEATf7DUxSkoSbVp6X7E7hV5TG4/sDnAAAAAElFTkSuQmCC",
    //     scale : 1.5,
    //    horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
    //    verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
    //    alignedAxis: Cesium.Cartesian3.ZERO, // default
    //    show: showOption
       
    // }
    
    return viewer.entities.add({
        show: option.show,
        position: option.position,
        point: option.point,
        label: option.label,
        billboard: option.billboard,
        pixelSize: option.pointSize?option.pointSize:8,
        color: option.color?option.color:Cesium.Color.YELLOW
       // billboard: defaultBillboard
    });
};
/**
 * Add Polygon Entity
 * Morphs drawn directly via this method cannot be vector edited
 * @param viewer Cesium.Viewer entity
 * @param option configuration information
 * @returns {Cesium.Entity}
 */
const addPolygon = function (viewer, option) {
    const defaultPolygon = new Cesium.PolygonGraphics({
        material: option.material?option.material:Cesium.Color.RED.withAlpha(0.5),
        outline: option.outline?option.outline:true,
        outlineColor: option.outlineColor?option.outlineColor:Cesium.Color.BLACK,
        outlineWidth: option.outlineWidth?option.outlineWidth:1,
        fill: option.fill?option.fill:true
    });
    if (option.polygon instanceof Cesium.PolygonGraphics) {
        option.polygon.merge(defaultPolygon);
    }
    else {
        option.polygon = new Cesium.PolygonGraphics(option.polygon);
        option.polygon.merge(defaultPolygon);
    }
    return viewer.entities.add({
        show: option.show,
        polygon: option.polygon,
    });
};
/**
 * add polyline
 * Draw polylines directly, the polylines drawn directly by this method cannot be edited by vector
 * @param option configuration
 * @param viewer viewr实例
 * @return cesium实体
 */
const addPolyline = function (viewer, option) {
    const color = option.lineMaterial;
    const defaultPolyline = new Cesium.PolylineGraphics({
        positions: [],
        clampToGround: true,
        material:  option.lineMaterial?option.lineMaterial:Cesium.Color.GREENYELLOW,
        width: option.polylineWidth?option.polylineWidth:1
    });
    if (option.polyline instanceof Cesium.PolylineGraphics) {
        option.polyline.merge(defaultPolyline);
    }
    else {
        option.polyline = new Cesium.PolylineGraphics(option.polyline);
        option.polyline.merge(defaultPolyline);
    }
    return viewer.entities.add({
        show: option.show,
        polyline: option.polyline,
    });
};
/**
 * The method of calculating the center of gravity may be problematic
 * @param {array<Cesium.Cartesian3>} positions 3D point collection
 * @return {Cesium.Cartesian3}
 */
const getCenterPoint = function (positions) {
    let x = 0;
    let y = 0;
    let z = 0;
    for (const position of positions) {
        x += position.x;
        y += position.y;
        z += position.z;
    }
    return new Cesium.Cartesian3(x / positions.length, y / positions.length, z / positions.length);
};
/**
 * Get the center of gravity according to the point set and then set the entity,position
 * @param {Cesium.Entity} entity
 * @param {array<Cesium.Cartesian3>} positions
 */
const setPosition = function (entity, positions) {
    entity = new Cesium.Entity({
        ...entity,
        position: getCenterPoint(positions),
    });
};
/**
 * Set the entity label
 * @param {Cesium.Entity} entity Entities that need to be set
 * @param {Cesium.LabelGraphics} option configuration
 * @example
 * Index.setLabel(entity, {
 * 	text: "slalalal",
 * 	fillColor: Cesium.Color.PINK,
 * 	eyeOffset: new Cesium.Cartesian3(0, 0, -1000000),
 * });
 */
const setLabel = function (entity, option) {
    entity.label = new Cesium.LabelGraphics(option);
};
/**
 * Set the entity billboard
 * @param {Cesium.Entity} entity Entities that need to be set
 * @param {Cesium.BillboardGraphics} option configuration
 */
const setBillboard = function (entity, option) {
    entity.billboard = new Cesium.BillboardGraphics(option);
};
/**
 * svg picture transfer to image
 * @param {string} svg
 * @param {number?} width
 * @param {number?} height
 * @param {string?} color
 * @return {HTMLImageElement}
 */
const svgToImage = function (svg, width, height, color = "#fff") {
    const img = new Image(width, height);
    svg = svg.replace(/"#[\da-f]{3}([\da-f]{3})?"/gi, `"${color}"`);
    img.src = "data:image/svg+xml;base64,";
    window.btoa(unescape(encodeURIComponent(svg)));
    img.style.color = color;
    return img;
};
/**
 * Inertial frame rotation

 * @param drawer
 */
function inertial(drawer) {
    const { camera } = drawer.viewer;
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}
/**
 * Earth-fixed rotation
 * @param drawer
 */
function fixedRotation(drawer) {
    const { camera, scene, clock } = drawer.viewer;
    if (scene.mode !== Cesium.SceneMode.SCENE3D)
        return;
    const icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(clock.currentTime);
    if (!icrfToFixed)
        return;
    const transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
    if (Cesium.defined(icrfToFixed)) {
        const offset = Cesium.Cartesian3.clone(camera.position);
        camera.lookAtTransform(transform, offset);
    }
}
/**
 * turn on earth rotation
 * @param drawer instance of CesiumDrawer
 */
function openFixedRotation(drawer) {
    // if (this.isFixedRotation) return;
    drawer.viewer.scene.postUpdate.removeEventListener(inertial.bind(drawer, drawer));
    drawer.viewer.scene.postUpdate.addEventListener(fixedRotation.bind(drawer, drawer));
    // this.isFixedRotation = true;
}
/**
 * turn off earth rotation
 * @param drawer instance of CesiumDrawer
 */
function closeFixedRotation(drawer) {
    // if (!this.isFixedRotation) return;
    drawer.viewer.scene.postUpdate.removeEventListener(fixedRotation.bind(drawer, drawer));
    drawer.viewer.scene.postUpdate.addEventListener(inertial.bind(drawer, drawer));
    // this.isFixedRotation = false;
}

/* eslint-disable import/prefer-default-export */
/**
 * How to change the cursor style
 * @param {cursorType} type Cursor pointer type
 */
const setCursorStyle = function (type) {
    document.body.style.cursor = type;
};

/* eslint-disable no-dupe-class-members */
/**
 * global event entity
 */
class Global {
    constructor() {
        /**
         * Drawer Instance repository
         */
        this.drawerRepository = [];
        /**
         * Cesium.Viewer instance
         * @deprecated
         * delete in next version
         * each Drawer instance should have itself viewer, so cache the viewer is not necessary
         */
        // private viewer!: Cesium.Viewer;
        /**
         * event listener
         * each viewer should have itself event handler.
         */
        this.screenSpaceEventHandlers = [];
        /**
         * global state

         * @private
         */
        this.globalStatus = "view";
    }
    /**
     * Whether it is ground-fixed rotation
     * @deprecated
     * Because the function of automatically switching rotation has been cancelled, this property is no longer needed
     * @private
     */
    // private isFixedRotation = false;
    /**
     * 设置global状态
     */
    setGlobalStatus(status) {
        this.globalStatus = status;
    }
    /**
     * Initialize all drawers
     */
    initAllDrawer() {
        for (const cesiumDrawer of this.drawerRepository) {
            cesiumDrawer.init();
        }
    }
    /**
     * Search through the entity in the drawer to see which drawer instance the entity belongs to
     * @param entity 
     * @returns {EntityFrom} Returns the entity type and the drawer instance it belongs to, or undefined if the entity does not belong to any drawer instance

     */
    findDrawer(entity) {
        let D;
        let entityType;
        for (const drawer of this.drawerRepository) {
            entityType = diffEntityType(entity, drawer);
            if (entityType) {
                D = drawer;
                break;
            }
        }
        if (entityType) {
            return {
                drawer: D,
                entityType,
            };
        }
        return {
            drawer: undefined,
            entityType: undefined,
        };
    }
    /**
     * Register drawer instance
     * @param viewer cesiumviewer
     * @param drawer CesiumDrawer
     * @param option 
     */
    registerDrawer(viewer, drawer, option) {
        //v0.1.1When starting to support the creation of drawer instances, different viewers are targeted, so the viewer is no longer cached, but obtained from the viewer of each drawer instance

        // this.viewer = viewer;
        this.drawerRepository.push(drawer);
        this.initialize(drawer, option);
    }
    /**
     * initialization
     * @param drawer CesiumDrawer
     * @param option 
     * @private
     */
    initialize(drawer, option) {
        if (option !== undefined && typeof option !== "object")
            throw new TypeError("option must be a object");
        const O = {
            enableCollisionDetection: true,
            showFrameRate: true,
            enableLighting: true,
            inertialRotation: false,
            ...option,
        };
        const screenSpaceEventHandler = this.setHandler(drawer);
        // cache event handlers
        this.screenSpaceEventHandlers.push(screenSpaceEventHandler);
        this.registerEvent(drawer, screenSpaceEventHandler);
        // v0.1.1The method of automatically switching the rotation mode is removed after the version
        // O.inertialRotation && this.listenClock(drawer);
        O.inertialRotation && CesiumDrawer.openFixedRotation(drawer);
        drawer.viewer.scene.debugShowFramesPerSecond = O.showFrameRate;
        // drawer.#viewer.scene.screenSpaceCameraController.maximumZoomDistance = 22000000;
        // drawer.#viewer.scene.globe.depthTestAgainstTerrain = false; //false, When drawing entities, depth detection needs to be ignored to prevent elevation occlusion.

        drawer.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        // No cameras allowed underground

        drawer.viewer.scene.screenSpaceCameraController.enableCollisionDetection =
            O.enableCollisionDetection;
        drawer.viewer.scene.globe.enableLighting = O.enableLighting;
    }
    /**
     * listening time
     * @deprecated
     * Removed in next version
     * @param drawer
     * @private
     */
    // private listenClock(drawer: CesiumDrawer) {
    // 	drawer.viewer.clock.onTick.addEventListener((clock) => {
    // 		clock.shouldAnimate
    // 			? CesiumDrawer.openFixedRotation(drawer)
    // 			: CesiumDrawer.closeFixedRotation(drawer);
    // 	});
    // }
    /**
     * Set event handler
     * @param drawer CesiumDrawer实例
     * @private
     */
    setHandler(drawer) {
        return new Cesium.ScreenSpaceEventHandler(drawer.viewer.canvas); // 创建事件监听器
    }
    /**
     * 注册全局事件
     * @param drawer drawer实例
     * @param handler 事件处理者
     * @private
     */
    registerEvent(drawer, handler) {
        this.registerLeftDoubleClick(handler);
        //this.registerLeftClick(drawer, handler);
        this.registerMouseMove(drawer, handler);
    }
    /**
     * 注册按住ctrl的双击事件
     * @param {handler: Cesium.ScreenSpaceEventHandler} handler 事件处理者
     * @private
     */
    registerLeftDoubleClick(handler) {
        handler.setInputAction(() => {
            for (const drawer of this.drawerRepository) {
                drawer.init();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK, Cesium.KeyboardEventModifier.SHIFT);
    }
    /**
     * 注册全局的鼠标左键点击事件
     * @param drawer CesiumDrawer实例
     * @param handler 事件处理者
     * @private
     */
    registerLeftClick(drawer, handler) {
        handler.setInputAction(this.
            viewLeftClick.bind(this, drawer), Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    /**
     * 注册全局的鼠标移动事件
     * @param drawer CesiumDrawer实例
     * @param handler 事件处理者
     * @private
     */
    registerMouseMove(drawer, handler) {
        handler.setInputAction(this.viewMouseMove.bind(this, drawer), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    // 查看状态，leftClick回调
    async viewLeftClick(drawer, ...event) {
        // 如果是新增状态则不允许实体切换。
        // 如果是查看或者编辑模式，点击了不同的实体则切换drawer以及entity
        if (this.globalStatus === "add")
            return;
        const { position } = event[0];
        const entity = drawer.viewer.scene.pick(position);
        if (!entity)
            return;
        // 判断实体类型以及绘制这个实体的drawer
        const { entityType, drawer: D } = this.findDrawer(entity.id);
        // 如果是drawer绘制的实体
        if (entityType) {
            const eventRes = await D.emit(CesiumDrawer.EventTypeEnum.startEdit, entity.id, entityType);
            eventRes !== false && D.startEdit(entity.id, entityType);
        }
        else {
            // 如果不是drawer绘制的实体则通知所有的drawer实例有实体被点击了
            for (const drawerRepositoryElement of this.drawerRepository) {
                drawerRepositoryElement.emit(CesiumDrawer.EventTypeEnum.click, 
                // return entity and primitive not only entity
                entity.id || entity);
            }
        }
    }
    // 查看状态, mouseMove回调
    viewMouseMove(drawer, ...event) {
        const { endPosition } = event[0];
        this.timer && clearTimeout(this.timer);
        // 20毫秒防抖，提高核显机型体验
        this.timer = setTimeout(() => {
            // 获取实体
            const entity = drawer.viewer.scene.pick(endPosition, 1, 1);
            if (entity) {
                // 暂时注释掉，鼠标移动到实体上就变
                if (document.body.style.cursor !== "pointer")
                    setCursorStyle("pointer");
            }
            else if (document.body.style.cursor !== "default")
                setCursorStyle("default");
        }, 15);
    }
}

class Graph {
    /**
     * constructor
     */
    constructor(viewer, drawer) {
        this.viewer = viewer;
        this.drawer = drawer;
        /**
         * 保存通过polygon创建的多边形实体
         */
        this.entities = [];
        this.option = {}; // 配置信息
        this.optionMap = {}; // 多个面实体配置信息缓存，
        /**
         * 点实体集合，保存每个多边形的顶点
         */
        this.pointEntities = {};
        /**
         * 点位置集合，保存每个多边形的顶点坐标
         */
        this.pointPositions = {};
        /**
         * 中间点实体集合
         */
        this.middlePointEntities = {};
        /**
         * 中间点位置集合
         */
        this.middlePointPositions = {};
        /**
         * 当前活跃顶点实体
         */
        this.activePointEntity = {};
        /**
         * 是否正在拖拽
         */
        this.isDragging = false;
        // 方法集合
        this.methodsMap = {
            add: {
                leftClick: this.addLeftClick,
                mouseMove: this.addMouseMove,
                leftDoubleClick: this.addLeftDoubleClick,
                rightClick: this.addRightClick,
            },
            view: {},
            edit: {
                leftClick: this.editLeftClick,
                mouseMove: this.editMouseMove,
                leftDown: this.editLeftDown,
                leftUp: this.editLeftUp,
                rightClick: this.editRightClick,
            },
        };
        this.viewer = viewer;
        this.drawer = drawer;
    }
    /**
     * 开始绘制图形, 用于鼠标点选
     * @param option 配置
     */
    startDraw(option) { }
    /**
     * 直接根据点坐标以及样式在地图上绘制多边形
     * @param option 配置
     */
    draw(option) { }
    /**
     * 开始编辑
     */
    async startEdit(entity, entityType) {
        this.drawer.init("edit", entity, entityType);
        if (!("id" in this.drawer.activeEntity))
            return;
        const ID = this.drawer.activeEntity.id;
        // this.#cleanPeakPoint(this.drawer.activeEntity);
        // this.#cleanMiddlePoint(this.drawer.activeEntity);
        // this.#setPeakPoint(this.drawer.activeEntity);
        // this.#setMiddlePoint(this.drawer.activeEntity);
        this.showPeakEntity(this.drawer.activeEntity);
        this.showMiddlePoint(this.drawer.activeEntity);
        this.setCallback(this.drawer.activeEntity, this.pointPositions[ID]);
        // return [this.drawer.activeEntity, this.drawer.activeEntityType];
    }
    // 取消绘制
    async cancelDraw() {
        if (!("id" in this.drawer.activeEntity))
            return;
        const res = this.drawer.emit(CesiumDrawer.EventTypeEnum.cancelDraw, this.drawer.activeEntity, this.drawer.activeEntityType);
        // 响应cancel事件的返回值，如果结果不是false则继续执行，如果是false则终止取消
        if (!Object.is(res, false)) {
            this.deleteEntity(this.drawer.activeEntity);
            this.activePointEntity = {};
            this.drawer.init();
        }
    }
    // 完成编辑
    finishEdit() {
        if (!("id" in this.drawer.activeEntity))
            return;
        const ID = this.drawer.activeEntity.id;
        const res = this.drawer.emit(CesiumDrawer.EventTypeEnum.finishEdit, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID]);
        if (!Object.is(res, false)) {
            this.hiddenPeakEntity(this.drawer.activeEntity);
            this.hiddenMiddlePoint(this.drawer.activeEntity);
            this.offSetCallback(this.drawer.activeEntity, this.pointPositions[ID]);
        }
    }
    /**
     * 删除本实体以及相关的顶点
     * @param entity 要删除的实体
     */
    deleteEntity(entity) {
        const ID = entity.id;
        this.viewer.entities.remove(entity);
        const index = this.entities.findIndex((item) => item.id === ID);
        this.entities.splice(index, 1);
        this.cleanMiddlePoint(entity);
        this.cleanPeakPoint(entity);
        delete this.optionMap[ID];
        this.drawer.init();
    }
    /**
     * 插入节点，生成一个实体作为传入实体的节点
     * @param entity 需要被插入节点的实体
     * @param option 配置
     * @param index? 索引，如果不传或者传入的值大于实体节点则都会在末尾增加一个节点
     */
    insertNode(entity, option, index) {
        const ID = entity.id;
        let I = index;
        const point = addPoint(this.viewer, option);
        if (!("position" in option))
            return undefined;
        // 如果index不存在,则在末尾插入
        I || (I = this.pointEntities[ID].length - 1);
        // 如果index大于数组长度，则在末尾插入
        if (I > this.pointEntities[ID].length - 1)
            I = this.pointEntities[ID].length - 1;
        this.pointEntities[ID].splice(I, 0, point);
        if (option.position instanceof Cesium.Cartesian3) {
            this.pointPositions[ID].splice(I, 0, option.position);
        }
        this.cleanMiddlePoint(entity);
        this.setMiddlePoint(entity);
        this.hiddenMiddlePoint(entity);
        return point;
    }
    /**
     * 更新已有节点，生成一个实体作为传入实体的节点
     * @param entity 需要被更新节点的实体
     * @param option 配置
     * @param index? 索引，如果传入的所以无法获取到实体则会报错
     */
    updateNode(entity, option, index) {
        const ID = entity.id;
        const point = this.pointEntities[ID][index];
        // 如果这个所以找不到实体就返回
        if (point === undefined)
            return undefined;
        const newPoint = addPoint(this.viewer, option);
        this.pointEntities[ID][index] = newPoint;
        if (option.position instanceof Cesium.Cartesian3) {
            this.pointPositions[ID][index] = option.position;
        }
        this.viewer.entities.remove(point);
        return [point, newPoint];
    }
    /**
     * 删除已有节点，生成一个实体作为传入实体的节点
     * @param entity 需要被删除节点的实体
     * @param index 索引，如果不传或者传入的值大于实体节点列表的最大值，则会删除最后一个节点
     */
    deleteNode(entity, index) {
        const ID = entity.id;
        index || (index = this.pointEntities[ID].length - 1);
        index > this.pointEntities[ID].length - 1 &&
            (index = this.pointEntities[ID].length - 1);
        const point = this.pointEntities[ID][index];
        this.viewer.entities.remove(point);
        this.pointEntities[ID].splice(index, 1);
        this.pointPositions[ID].splice(index, 1);
        this.cleanMiddlePoint(entity);
        this.setMiddlePoint(entity);
        this.hiddenMiddlePoint(entity);
        return point;
    }
    /**
     * 获取已有节点
     * @param entity 需要被获取节点的实体
     * @param index 索引，如果不传则会获取所有的节点, 如果传入的索引大于拥有的节点数量，则会返回最后一个节点
     */
    getNode(entity, index) {
        const ID = entity.id;
        if (typeof index !== "number") {
            return this.pointEntities[ID];
        }
        index > this.pointEntities[ID].length - 1 &&
            (index = this.pointEntities[ID].length - 1);
        return this.pointEntities[ID][index];
    }
    /**
     * 获取已有节点的坐标
     * @param entity 需要被获取节点坐标的实体
     */
    getNodePositions(entity) {
        const ID = entity.id;
        return this.pointPositions[ID];
    }
    /**
     * 改变hierarchy的规则, 查看状态关闭callback，新增和编辑则开启callback
     * @param entity 实体
     * @param Car3Arr
     */
    setCallback(entity, Car3Arr) {
        if (entity.polygon instanceof Cesium.PolygonGraphics) {
            entity.polygon.hierarchy = new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(Car3Arr), false);
        }
    }
    /**
     * 改变hierarchy的规则, 查看状态关闭callback，新增和编辑则开启callback
     * @param entity 实体
     * @param Car3Arr
     */
    offSetCallback(entity, Car3Arr) {
        if (entity.polygon instanceof Cesium.PolygonGraphics) {
            entity.polygon.hierarchy = new Cesium.PositionPropertyArray(Car3Arr.map((item) => new Cesium.ConstantPositionProperty(item)));
        }
    }
    /**
     * 隐藏指定多边形的顶点实体
     * @param entity 多边形实体
     */
    hiddenPeakEntity(entity) {
        const ID = entity.id;
        for (const nodePoint of this.pointEntities[ID]) {
            nodePoint.show = false;
        }
    }
    /**
     * 隐藏中间点
     * @param entity 折线
     */
    hiddenMiddlePoint(entity) {
        const ID = entity.id;
        for (const extraPoint of this.middlePointEntities[ID]) {
            extraPoint.show = false;
        }
    }
    /**
     * 显示中间点
     * @param entity 折线
     */
    showMiddlePoint(entity) {
        const ID = entity.id;
        for (const extraPoint of this.middlePointEntities[ID]) {
            extraPoint.show = true;
        }
    }
    /**
     * 显示指定多边形的顶点实体
     * @param entity 多边形实体
     */
    showPeakEntity(entity) {
        const ID = entity.id;
        if (this.pointEntities[ID]) {
            for (const nodePoint of this.pointEntities[ID]) {
                nodePoint.show = true;
            }
        }
    }
    /**
     * 判断被点击的实体是否是当前活跃的多边形，或者是当前活跃多边形的顶点实体
     * @param entity
     */
    isBelongActiveEntity(entity) {
        // 如果实体就是当前活跃实体，则返回true
        if (!("id" in this.drawer.activeEntity))
            return false;
        if (entity.id === this.drawer.activeEntity.id)
            return true;
        const ID = this.drawer.activeEntity.id;
        const res = this.pointEntities[ID].find((item) => item.id === entity.id);
        if (res)
            return true;
        const mid = this.middlePointEntities[ID].find((item) => item.id === entity.id);
        return !!mid;
    }
    /**
     * 绘制中间点
     * @param entity
     */
    setMiddlePoint(entity) {
        const ID = entity.id;
        const arr = this.pointPositions[ID];
        for (const [key, value] of arr.entries()) {
            let position;
            let E;
            if (key === arr.length - 1) {
                position = computeMiddlePoint(value, arr[0]);
            }
            else {
                position = computeMiddlePoint(value, arr[key + 1]);
            }
            const option = CesiumDrawer.deepClone(this.optionMap[ID]);
            if ("extensionPoint" in option) {
                option.point = option.extensionPoint;
                E = addPoint(this.viewer, {
                    ...option,
                    position,
                });
                if (!this.middlePointEntities[ID])
                    this.middlePointEntities[ID] = [];
                if (!this.middlePointPositions[ID])
                    this.middlePointPositions[ID] = [];
                this.middlePointEntities[ID].push(E);
                this.middlePointPositions[ID].push(position);
            }
        }
    }
    /**
     * 清除顶点
     * @param entity
     */
    cleanPeakPoint(entity) {
        const ID = entity.id;
        const arr = this.pointEntities[ID];
        // const { point } = this.pointEntities[ID][0];
        if (arr) {
            for (const item of arr) {
                this.viewer.entities.remove(item);
            }
        }
        delete this.pointEntities[ID];
        delete this.pointPositions[ID];
    }
    /**
     * 绘制顶点
     * @param entity 需要被设置节点样式的定点实体
     */
    setPeakPoint(entity) {
        // const ID = entity.id;
        // const arr = entity.polygon.hierarchy.positions;
        // this.pointPositions[ID] = arr;
        // this.pointEntities[ID] = [];
        // for (const [key, value] of arr.entries()) {
        // 	// this.optionMap[ID].position = value;
        // 	const E = addPoint(this.viewer, {
        // 		point: this.optionMap[ID].point,
        // 		position: value,
        // 	});
        // 	this.pointEntities[ID].push(E);
        // }
    }
    /**
     * 清除中间点
     * @param  entity
     */
    cleanMiddlePoint(entity) {
        const ID = entity.id;
        const arr = this.middlePointEntities[ID];
        if (arr) {
            for (const item of arr) {
                this.viewer.entities.remove(item);
            }
        }
        delete this.middlePointEntities[ID];
        delete this.middlePointPositions[ID];
    }
    /**
     * 开始拖拽
     * @param point
     */
    startDrag(point) {
        this.isDragging = true;
        this.activePointEntity = point;
        setCursorStyle("crosshair");
        this.viewer.scene.screenSpaceCameraController.enableInputs = false;
    }
    /**
     * 把中间点转变成顶点
     * @param index 索引
     * @returns {Cesium.Entity}
     */
    middleToPeak(index) {
        if ("id" in this.drawer.activeEntity) {
            const ID = this.drawer.activeEntity.id;
            const position = this.middlePointPositions[ID][index];
            const entity = this.middlePointEntities[ID][index];
            this.viewer.entities.remove(entity);
            // this.optionMap[ID].position = position;
            const E = addPoint(this.viewer, {
                point: this.optionMap[ID].point,
                position,
            });
            this.pointPositions[ID].splice(index, 1, this.pointPositions[ID][index], position);
            this.pointEntities[ID].splice(index, 1, this.pointEntities[ID][index], E);
            return E;
        }
    }
    // 新增状态，leftClick回调
    addLeftClick(event) {
        const { position } = event;
        // 弧度换算笛卡尔坐标系
        const earthPosition = Car2ToCar3(position, this.viewer);
        // 如果点不在地球上就返回
        if (!earthPosition)
            return;
        if (!("id" in this.drawer.activeEntity))
            return;
        const ID = this.drawer.activeEntity.id;
        // this.#pointPositions[ID].push(earthPosition);
        // this.#pointEntities[ID].push(this.#activePointEntity);
        this.activePointEntity = {};
        setPosition(this.drawer.activeEntity, this.pointPositions[ID]);
        this.drawer.emit(CesiumDrawer.EventTypeEnum.drawing, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID]);
    }
    // 新增状态，mouseMove回调
    addMouseMove(event) {
        const { startPosition, endPosition } = event;
        Car2ToCar3(startPosition, this.viewer);
        const endEarthPosition = Car2ToCar3(endPosition, this.viewer);
        setCursorStyle("default");
        // 如果不在地球上就返回
        if (!endEarthPosition)
            return;
        // 如果位置在地球上存在
        setCursorStyle("crosshair");
        let ID;
        if ("id" in this.drawer.activeEntity)
            ID = this.drawer.activeEntity.id;
        if ("id" in this.activePointEntity &&
            "position" in this.activePointEntity) {
            // 改变当前点的坐标
            this.activePointEntity.position = new Cesium.ConstantPositionProperty(endEarthPosition);
            this.pointPositions[ID][this.pointPositions[ID].length - 1] =
                endEarthPosition;
        }
        else {
            this.activePointEntity = addPoint(this.viewer, {
                ...this.optionMap[ID],
                position: endEarthPosition,
            });
            // 绘制点之后放入队列
            this.pointPositions[ID].push(endEarthPosition);
            this.pointEntities[ID].push(this.activePointEntity);
        }
        // this.#pointPositions[ID].pop();
        // this.#pointEntities[ID].pop();
        // this.#pointPositions[ID].push(endEarthPosition);
        // this.#pointEntities[ID].push(this.#activePointEntity);
        setPosition(this.drawer.activeEntity, this.pointPositions[ID]);
        // 发送事件把实体和点位置发送出去
        this.drawer.emit(CesiumDrawer.EventTypeEnum.drawing, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID]);
    }
    // 新增模式， 左键双击事件回调
    addLeftDoubleClick() { }
    // 新增模式，右键单击回调
    addRightClick() {
        if (!("id" in this.drawer.activeEntity))
            return;
        const ID = this.drawer.activeEntity.id;
        this.viewer.entities.remove(this.activePointEntity);
        // 当只剩一个点的时候取消绘制
        if (this.pointPositions[ID].length <= 1) {
            this.cancelDraw();
            return;
        }
        this.pointPositions[ID].pop();
        this.pointEntities[ID].pop();
        this.activePointEntity =
            this.pointEntities[ID][this.pointEntities[ID].length - 1];
        setPosition(this.drawer.activeEntity, this.pointPositions[ID]);
        this.drawer.emit(CesiumDrawer.EventTypeEnum.drawing, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID]);
    }
    // 编辑状态，leftClick回调
    async editLeftClick(event) {
        // 如果正在拖拽则不调用
        if (this.isDragging)
            return;
        const { position } = event;
        const E = this.viewer.scene.pick(position);
        const entity = E && E.id;
        if (!("id" in this.drawer.activeEntity))
            return;
        this.drawer.activeEntity.id;
        if (!entity) {
            // 点击了空白地区
            this.finishEdit();
            this.drawer.init();
            return;
        }
        // 点击了实体
        const res = this.isBelongActiveEntity(entity);
        // 点击的是当前实体
        if (res)
            return;
        // 点击了别的实体
        const { entityType, drawer } = this.drawer.global.findDrawer(entity) || {};
        // 把编辑状态切换到被点击实体
        // 如果实体已注册则切换，否则直接初始化
        if (entityType) {
            this.finishEdit();
            this.drawer.init();
            const eventRes = await this.drawer.emit(CesiumDrawer.EventTypeEnum.startEdit, entity, entityType);
            if (eventRes) {
                drawer.startEdit(entity, entityType);
            }
        }
        else {
            this.finishEdit();
            this.drawer.init();
        }
    }
    // 编辑状态，mouseMove回调
    editMouseMove(event) {
        const { startPosition, endPosition } = event;
        // 如果正在编辑
        if (this.isDragging) {
            // 弧度换算笛卡尔坐标系
            Car2ToCar3(startPosition, this.viewer);
            const endEarthPosition = Car2ToCar3(endPosition, this.viewer);
            if (!endEarthPosition)
                return;
            if (!("id" in this.drawer.activeEntity))
                return;
            const ID = this.drawer.activeEntity.id;
            const index = this.pointEntities[ID].findIndex((item) => item.id === this.activePointEntity.id);
            this.activePointEntity.position =
                new Cesium.ConstantPositionProperty(endEarthPosition);
            this.pointPositions[ID][index] = endEarthPosition;
            setPosition(this.drawer.activeEntity, this.pointPositions[ID]);
            this.drawer.emit(CesiumDrawer.EventTypeEnum.editing, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID]);
        }
        else {
            // 获取实体
            const E = this.viewer.scene.pick(endPosition, 1, 1);
            const entity = E && E.id;
            if (entity) {
                // if (entity.id === this.drawer.activeEntity.id) {
                // } else {
                // }
                if (document.body.style.cursor !== "pointer")
                    setCursorStyle("pointer");
            }
            else {
                if (document.body.style.cursor !== "default")
                    setCursorStyle("default");
            }
        }
    }
    // 编辑状态，leftDown回调
    editLeftDown(event) {
        const { position } = event;
        const entity = this.viewer.scene.pick(position);
        if (!entity)
            return;
        if (!("id" in this.drawer.activeEntity))
            return;
        const ID = this.drawer.activeEntity.id;
        // 判断是否是当前活跃实体的顶点实体
        const res = this.pointEntities[ID].find((item) => item.id === entity.id.id);
        if (res) {
            this.hiddenMiddlePoint(this.drawer.activeEntity);
            this.startDrag(entity.id);
        }
        // 判断是否是当前活跃实体的中间点
        const index = this.middlePointEntities[ID].findIndex((item) => item.id === entity.id.id);
        if (index > -1) {
            const E = this.middleToPeak(index);
            this.hiddenMiddlePoint(this.drawer.activeEntity);
            this.startDrag(E);
        }
    }
    // 编辑状态，leftUp回调
    editLeftUp() {
        if (this.isDragging) {
            if (!("id" in this.drawer.activeEntity))
                return;
            const ID = this.drawer.activeEntity.id;
            setPosition(this.drawer.activeEntity, this.pointPositions[ID]);
            this.drawer.emit(CesiumDrawer.EventTypeEnum.editing, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID]);
            this.cleanMiddlePoint(this.drawer.activeEntity);
            this.setMiddlePoint(this.drawer.activeEntity);
            // 绘制完成之后释放掉活跃点
            this.activePointEntity = {};
            this.isDragging = false;
            setCursorStyle("default");
            this.viewer.scene.screenSpaceCameraController.enableInputs = true;
        }
    }
    // 编辑状态，右键单击回调
    editRightClick(event) {
        const { position } = event;
        // 获取实体
        const entity = this.viewer.scene.pick(position);
        if (!entity)
            return;
        if (!("id" in this.drawer.activeEntity))
            return;
        const ID = this.drawer.activeEntity.id;
        // 如果是实体本身
        if (entity.id.id === this.drawer.activeEntity.id) {
            setPosition(this.drawer.activeEntity, this.pointPositions[ID]);
            this.drawer.emit(CesiumDrawer.EventTypeEnum.delete, this.drawer.activeEntity, this.drawer.activeEntityType);
            this.deleteEntity(this.drawer.activeEntity);
            this.drawer.init();
            return;
        }
        const index = this.pointEntities[ID].findIndex((item) => item.id === entity.id.id);
        // 如果是实体顶点
        if (index > -1) {
            this.viewer.entities.remove(this.pointEntities[ID][index]);
            this.pointEntities[ID].splice(index, 1);
            this.pointPositions[ID].splice(index, 1);
            this.cleanMiddlePoint(this.drawer.activeEntity);
            this.setMiddlePoint(this.drawer.activeEntity);
            setPosition(this.drawer.activeEntity, this.pointPositions[ID]);
            this.drawer.emit(CesiumDrawer.EventTypeEnum.editing, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID]);
            if (this.pointPositions[ID].length === 0) {
                this.drawer.emit(CesiumDrawer.EventTypeEnum.delete, this.drawer.activeEntity, this.drawer.activeEntityType);
                this.deleteEntity(this.drawer.activeEntity);
                this.drawer.init();
            }
        }
    }
}

/**
 * 初始化draw事件监听
 */
class Initial extends Graph {
    /**
     * constructor
     * @param viewer cesium实列
     * @param drawer drawer实例
     *
     */
    constructor(viewer, drawer) {
        super(viewer, drawer);
        this.entities = [];
        this.methodsMap = {
            add: {},
            view: {},
            edit: {},
        };
    }
}

/**
 * @enum
 * 实体类型集合
 */
var EntityTypeEnum;
(function (EntityTypeEnum) {
    EntityTypeEnum["polyline"] = "polyline";
    // rectangle = "rectangle",
    EntityTypeEnum["polygon"] = "polygon";
    EntityTypeEnum["point"] = "point";
    EntityTypeEnum["initial"] = "initial";
})(EntityTypeEnum || (EntityTypeEnum = {}));
/**
 * @enum
 * 事件类型集合
 */
var EventTypeEnum;
(function (EventTypeEnum) {
    EventTypeEnum["startDraw"] = "startDraw";
    EventTypeEnum["finishDraw"] = "finishDraw";
    EventTypeEnum["drawing"] = "drawing";
    EventTypeEnum["startEdit"] = "startEdit";
    EventTypeEnum["mouseOver"] = "mouseOver";
    EventTypeEnum["editing"] = "editing";
    EventTypeEnum["finishEdit"] = "finishEdit";
    EventTypeEnum["delete"] = "delete";
    EventTypeEnum["cancelDraw"] = "cancelDraw";
    EventTypeEnum["click"] = "click";
})(EventTypeEnum || (EventTypeEnum = {}));
/**
 * 是否是cesium实体
 * @param entity
 */
function isCesiumEntity(entity) {
    return entity.constructor === Cesium.Entity;
}

/* eslint-disable no-dupe-class-members */
/**
 * 绘制点的类
 * 实例对象中包含点的实体，传入的option信息
 */
class Point extends Graph {
    /**
     * @param viewer cesium实列
     * @param drawer drawer实例
     */
    constructor(viewer, drawer) {
        super(viewer, drawer);
        /**
         * 保存通过point实例创建的点
         */
        this.entities = [];
        this.isDragging = false; // 是否正在拖拽
        // 方法集合
        this.methodsMap = {
            add: {
                leftClick: this.addLeftClick,
                mouseMove: this.addMouseMove,
                rightClick: this.addRightClick,
            },
            view: {},
            edit: {
                leftClick: this.editLeftClick,
                mouseMove: this.editMouseMove,
                leftDown: this.editLeftDown,
                leftUp: this.editLeftUp,
                rightClick: this.editRightClick,
            },
        };
        // this.viewer = viewer;
        // this.drawer = drawer;
    }
    /**
     * 开始绘制图形, 用于鼠标点选
     * @param {Object} option 配置参数
     */
    startDraw(option) {
        this.drawer.activeEntity = addPoint(this.viewer, option);
        this.drawer.emit(CesiumDrawer.EventTypeEnum.startDraw, this.drawer.activeEntity, "point");
        // 切换状态
        this.drawer.init("add", this.drawer.activeEntity, CesiumDrawer.EntityTypeEnum.point);
        // 保存配置信息
        this.option = option;
    }
    /**
     * 直接根据点坐标以及样式在地图上绘制点
     * @param {Object} option 配置参数
     * @param {"point"} option.type 绘制图像的类型
     * @param {boolean} option.show 绘制的图形是否展示
     * @param {Cesium.Cartesian3} option.position 点的位置
     * @param {Cesium.PointGraphics} option.point 点的图形配置
     * @param {Cesium.LabelGraphics} option.label 文字的配置
     * @param {Cesium.BillboardGraphics} option.billboard 广告牌的配置
     */
    draw(option) {
        // option.positions instanceof Array
        // 	? (option.position = option.positions[0])
        // 	: (option.position = option.positions);
        const entity = addPoint(this.viewer, option);
        this.entities.push(entity);
        this.drawer.emit(CesiumDrawer.EventTypeEnum.finishDraw, entity, "point");
        return entity;
    }
    // 取消绘制
    async cancelDraw() {
        const res = this.drawer.emit(CesiumDrawer.EventTypeEnum.cancelDraw, this.drawer.activeEntityType, "point");
        if (Object.is(res, false))
            return;
        if (!isCesiumEntity(this.drawer.activeEntity))
            return;
        this.viewer.entities.remove(this.drawer.activeEntity);
        this.drawer.activeEntity = {};
        this.drawer.init();
    }
    /**
     * 开始编辑
     * @param entity 要编辑的实体
     */
    async startEdit(entity, entityType) {
        this.drawer.init("edit", entity, entityType);
        // if (!("id" in this.drawer.activeEntity)) return;
        // const ID = this.drawer.activeEntity.id;
    }
    // 完成编辑
    finishEdit() {
        this.drawer.emit(CesiumDrawer.EventTypeEnum.finishEdit, this.drawer.activeEntity, this.drawer.activeEntityType);
    }
    /**
     * 删除本实体以及相关的顶点
     * @param entity cesium实体
     */
    deleteEntity(entity) {
        this.viewer.entities.remove(entity);
        const index = this.entities.findIndex((item) => item.id === entity.id);
        this.entities.splice(index, 1);
        this.drawer.init();
    }
    // 新增状态，leftClick回调
    addLeftClick(event) {
        const { position } = event;
        const earthPosition = Car2ToCar3(position, this.viewer);
        // 如果点不在地球上就返回
        if (!earthPosition)
            return;
        // 发送点绘制完成的事件
        this.drawer.emit(CesiumDrawer.EventTypeEnum.finishDraw, this.drawer.activeEntity, earthPosition);
        // 绘制完成之后把实体存放一下
        if (isCesiumEntity(this.drawer.activeEntity)) {
            this.entities.push(this.drawer.activeEntity);
        }
        setCursorStyle("default");
        this.drawer.init();
    }
    // 新增状态，mouseMove回调
    addMouseMove(event) {
        const { startPosition, endPosition } = event;
        const startEarthPosition = Car2ToCar3(startPosition, this.viewer);
        const endEarthPosition = Car2ToCar3(endPosition, this.viewer);
        setCursorStyle("default");
        // 如果不在地球上就返回
        if (!endEarthPosition)
            return;
        // 如果位置在地球上存在
        setCursorStyle("crosshair");
        if ("id" in this.drawer.activeEntity && this.drawer.activeEntity.id) {
            this.drawer.activeEntity.position = new Cesium.ConstantPositionProperty(endEarthPosition);
        }
        else {
            this.option.position = endEarthPosition;
            this.drawer.activeEntity = addPoint(this.viewer, this.option);
        }
        // 发送事件把实体和点位置发送出去
        this.drawer.emit(CesiumDrawer.EventTypeEnum.drawing, this.drawer.activeEntity, startEarthPosition, endEarthPosition);
    }
    // 新增状态右键点击事件
    addRightClick() {
        this.cancelDraw();
    }
    // 编辑状态，leftClick回调
    async editLeftClick(event) {
        const { position } = event;
        const E = this.viewer.scene.pick(position);
        const entity = E && E.id;
        if (!entity) {
            this.finishEdit();
            this.drawer.init();
            return;
        }
        // 点击了其他非活跃实体
        if (!isCesiumEntity(this.drawer.activeEntity))
            return;
        if (entity.id !== this.drawer.activeEntity.id) {
            const { entityType, drawer } = this.drawer.global.findDrawer(entity) || {};
            if (entityType) {
                this.finishEdit();
                this.drawer.init();
                const eventRes = await this.drawer.emit(CesiumDrawer.EventTypeEnum.startEdit, entity, entityType);
                if (eventRes) {
                    drawer.startEdit(entity, entityType);
                }
            }
            else {
                this.drawer.init();
            }
        }
    }
    // 编辑状态，mouseMove回调
    editMouseMove(event) {
        const { startPosition, endPosition } = event;
        if (!isCesiumEntity(this.drawer.activeEntity))
            return;
        // 如果正在拖拽
        if (this.isDragging) {
            // 弧度换算笛卡尔坐标系
            Car2ToCar3(startPosition, this.viewer);
            const endEarthPosition = Car2ToCar3(endPosition, this.viewer);
            if (!endEarthPosition)
                return;
            this.drawer.activeEntity.position = new Cesium.ConstantPositionProperty(endEarthPosition);
        }
        else {
            // 获取实体
            const E = this.viewer.scene.pick(endPosition, 1, 1);
            const entity = E && E.id;
            if (entity) {
                if (document.body.style.cursor !== "pointer")
                    setCursorStyle("pointer");
            }
            else {
                if (document.body.style.cursor !== "default")
                    setCursorStyle("default");
            }
        }
    }
    // 编辑状态，leftDown回调
    editLeftDown(event) {
        const { position } = event;
        const entity = this.viewer.scene.pick(position);
        // 按下位置是当前活跃的实体
        if (!isCesiumEntity(this.drawer.activeEntity))
            return;
        if (entity && entity.id.id === this.drawer.activeEntity.id) {
            this.isDragging = true;
            setCursorStyle("crosshair");
            this.viewer.scene.screenSpaceCameraController.enableInputs = false;
        }
    }
    // 编辑状态，leftUp回调
    editLeftUp() {
        if (this.isDragging) {
            this.drawer.emit(CesiumDrawer.EventTypeEnum.editing, this.drawer.activeEntity, this.drawer.activeEntityType);
            this.isDragging = false;
            setCursorStyle("default");
        }
        this.viewer.scene.screenSpaceCameraController.enableInputs = true;
    }
    // 编辑状态，右键单击回调
    editRightClick(event) {
        const { position } = event;
        // 获取实体
        const entity = this.viewer.scene.pick(position);
        if (!isCesiumEntity(this.drawer.activeEntity))
            return;
        if (entity && entity.id.id === this.drawer.activeEntity.id) {
            this.drawer.emit(CesiumDrawer.EventTypeEnum.delete, this.drawer.activeEntity, this.drawer.activeEntityType);
            const index = this.entities.findIndex((item) => item.id === this.drawer.activeEntity.id);
            this.viewer.entities.remove(this.drawer.activeEntity);
            this.entities.splice(index, 1);
            this.drawer.init();
        }
    }
}

/* eslint-disable no-dupe-class-members */
/**
 * 绘制贴地折线
 */
class Polyline extends Graph {
    /**
     * @param viewer cesium实列
     * @param drawer drawer实例
     */
    constructor(viewer, drawer) {
        super(viewer, drawer);
        /**
         * 保存通过polygon创建的多边形实体
         */
        this.entities = [];
        /**
         * 当前配置信息
         * @private
         */
        this.option = {};
        /**
         * 折线配置信息集合
         * @protected
         */
        this.optionMap = {};
        // 方法集合
        this.methodsMap = {
            add: {
                leftClick: this.addLeftClick,
                mouseMove: this.addMouseMove,
                leftDoubleClick: this.addLeftDoubleClick,
                rightClick: this.addRightClick,
                leftDown: this.addLeftDown,
                leftUp: this.addLeftUp,
            },
            view: {},
            edit: {
                leftClick: this.editLeftClick,
                mouseMove: this.editMouseMove,
                leftDown: this.editLeftDown,
                leftUp: this.editLeftUp,
                rightClick: this.editRightClick,
            },
        };
        // this.viewer = viewer;
        // this.drawer = drawer;
    }
    /**
     * 开始绘制图形, 用于鼠标点选
     * @param option 配置
     */
    startDraw(option) {
        this.option = option;
        const entity = addPolyline(this.viewer, this.option);
        this.entities.push(entity);
        const ID = entity.id;
        const extensionPoint = new Cesium.PointGraphics({
            color: this.option.color?this.option.color:Cesium.Color.YELLOW,
            pixelSize: this.option.pointSize?this.option.pointSize:8
            ,
        });
        if (this.option.extensionPoint instanceof Cesium.PointGraphics) {
            this.option.extensionPoint.merge(extensionPoint);
        }
        else {
            this.option.extensionPoint = new Cesium.PointGraphics(this.option.extensionPoint);
            this.option.extensionPoint.merge(extensionPoint);
        }
        this.optionMap[ID] = this.option;
        this.pointEntities[ID] = [];
        this.pointPositions[ID] = [];
        // 绘制规则
        this.setCallback(entity, this.pointPositions[ID]);
        // 切换状态
        this.drawer.init("add", entity, CesiumDrawer.EntityTypeEnum.polyline);
        // 发送开始绘制的事件
        this.drawer.emit(CesiumDrawer.EventTypeEnum.startDraw, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID], this.pointEntities[ID]);
    }
    /**
     * 直接根据点坐标以及样式在地图上折线
     * @param option 配置
     */
    draw(option) {
        const entity = addPolyline(this.viewer, option);
        this.entities.push(entity);
        const ID = entity.id;
        this.option = option;
        const extensionPoint = new Cesium.PointGraphics({
            color: this.option.color?this.option.color:Cesium.Color.YELLOW.withAlpha(0.5),
            pixelSize: this.option.pointSize?this.option.pointSize:8 ,
        });
        if (this.option.extensionPoint instanceof Cesium.PointGraphics) {
            this.option.extensionPoint.merge(extensionPoint);
        }
        else {
            this.option.extensionPoint = new Cesium.PointGraphics(this.option.extensionPoint);
            this.option.extensionPoint.merge(extensionPoint);
        }
        this.optionMap[ID] = this.option;
        this.setPeakPoint(entity);
        this.setMiddlePoint(entity);
        this.hiddenMiddlePoint(entity);
        this.hiddenPeakEntity(entity);
        this.drawer.emit(CesiumDrawer.EventTypeEnum.finishDraw, entity, "polyline", this.pointPositions[ID], this.pointEntities[ID]);
        return entity;
    }
    /**
     * 改变hierarchy的规则, 查看状态关闭callback，新增和编辑则开启callback
     * @param entity 实体
     * @param Car3Arr
     */
    setCallback(entity, Car3Arr) {
        if (!(entity.polyline instanceof Cesium.PolylineGraphics))
            return;
        entity.polyline.positions = new Cesium.CallbackProperty(() => Car3Arr, false);
    }
    /**
     * 改变hierarchy的规则, 查看状态关闭callback，新增和编辑则开启callback
     * @param {Cesium.Entity} entity 实体
     * @param {Array<Cesium.Cartesian3>} Car3Arr
     */
    offSetCallback(entity, Car3Arr) {
        if (!(entity.polyline instanceof Cesium.PolylineGraphics))
            return;
        entity.polyline.positions = new Cesium.PositionPropertyArray(Car3Arr.map((car3) => new Cesium.ConstantPositionProperty(car3)));
    }
    /**
     * 已经存在线实体，根据配置绘制线实体的顶点
     * @param entity 要设置节点的实体(折线实体)
     */
    setPeakPoint(entity) {
        const ID = entity.id;
        if (entity.polyline instanceof Cesium.PolylineGraphics &&
            entity.polyline.positions !== undefined) {
            const arr = entity.polyline.positions.valueOf();
            this.pointPositions[ID] = arr;
            this.pointEntities[ID] = [];
            for (const [key, value] of arr.entries()) {
                const E = addPoint(this.viewer, {
                    ...this.optionMap[ID],
                    position: value,
                });
                this.pointEntities[ID].push(E);
            }
        }
    }
    /**
     * 已经存在线实体，根据配置，绘制线实体的中间点
     * @param entity
     */
    setMiddlePoint(entity) {
        const ID = entity.id;
        const pointPositions = this.pointPositions[ID];
        for (const [key, value] of pointPositions.entries()) {
            let position;
            let E;
            if (key === pointPositions.length - 1) {
                break;
            }
            else {
                position = computeMiddlePoint(pointPositions[key], pointPositions[key + 1]);
                const option = this.optionMap[ID];
                E = addPoint(this.viewer, {
                    point: option.extensionPoint,
                    position,
                });
            }
            if (this.middlePointEntities[ID] === undefined)
                this.middlePointEntities[ID] = [];
            if (this.middlePointPositions[ID] === undefined)
                this.middlePointPositions[ID] = [];
            this.middlePointEntities[ID].push(E);
            this.middlePointPositions[ID].push(position);
        }
    }
    // 新增模式， 左键双击事件回调
    addLeftDoubleClick() {
        if (!("id" in this.drawer.activeEntity))
            return;
        const ID = this.drawer.activeEntity.id;
        // 因为改了一下绘制点的逻辑，所以下面这些代码先注释调，测试如果没有问题，可以删除注释部分
        // 如果点少于两个时候用户双击了
        if (this.pointPositions[ID].length < 2) {
            return;
        }
        this.setMiddlePoint(this.drawer.activeEntity);
        this.offSetCallback(this.drawer.activeEntity, this.pointPositions[ID]);
        this.hiddenPeakEntity(this.drawer.activeEntity);
        this.hiddenMiddlePoint(this.drawer.activeEntity);
        // 双击结束新增
        this.drawer.emit(CesiumDrawer.EventTypeEnum.finishDraw, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID], this.pointEntities[ID]);
        this.activePointEntity = {};
        setCursorStyle("default");
        this.drawer.init();
    }
    // 新增模式鼠标左键按下
    addLeftDown() {
        this.isDragging = true;
    }
    // 新增模式鼠标左键抬起
    addLeftUp() {
        this.isDragging = false;
    }
}

/* eslint-disable no-dupe-class-members */
/**
 * 绘制多边形
 */
class Polygon extends Graph {
    constructor(viewer, drawer) {
        super(viewer, drawer);
        /**
         * 保存通过polygon创建的多边形实体
         */
        this.entities = [];
        /**
         * 当前配置信息
         * @protected
         */
        this.option = {};
        /**
         * 多个面实体配置信息缓存
         * @protected
         */
        this.optionMap = {};
        // 方法集合
        this.methodsMap = {
            add: {
                leftClick: this.addLeftClick,
                mouseMove: this.addMouseMove,
                leftDoubleClick: this.addLeftDoubleClick,
                rightClick: this.addRightClick,
            },
            view: {},
            edit: {
                leftClick: this.editLeftClick,
                mouseMove: this.editMouseMove,
                leftDown: this.editLeftDown,
                leftUp: this.editLeftUp,
                rightClick: this.editRightClick,
            },
        };
        // this.viewer = viewer;
        // this.drawer = drawer;
    }
    /**
     * 开始绘制图形, 用于鼠标点选
     * @param option 配置
     */
    startDraw(option) {
        this.option = option;
        if (!this.option.polygon)
            this.option.polygon = new Cesium.PolygonGraphics();
        this.option.polygon.hierarchy = new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy([]), false);
        // 如果没有实体则创建实体
        const entity = addPolygon(this.viewer, this.option);
        this.entities.push(entity);
        const ID = entity.id;
        const extensionPoint = new Cesium.PointGraphics({
            color: this.option.color?this.option.color:Cesium.Color.YELLOW,
            pixelSize: this.option.pointSize?this.option.pointSize:8
        });
        if (this.option.extensionPoint instanceof Cesium.PointGraphics) {
            this.option.extensionPoint.merge(extensionPoint);
        }
        else {
            this.option.extensionPoint = new Cesium.PointGraphics(this.option.extensionPoint);
            this.option.extensionPoint.merge(extensionPoint);
        }
        this.optionMap[ID] = this.option;
        this.pointEntities[ID] = [];
        this.pointPositions[ID] = [];
        // 改变多边形绘制规则
        this.setCallback(entity, this.pointPositions[ID]);
        // 切换状态
        this.drawer.init("add", entity, CesiumDrawer.EntityTypeEnum.polygon);
        // 发送开始绘制的事件
        this.drawer.emit(CesiumDrawer.EventTypeEnum.startDraw, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID]);
    }
    /**
     * 直接根据点坐标以及样式在地图上绘制多边形
     * @param option 配置
     */
    draw(option) {
        // option.polygon.hierarchy = new Cesium.PolygonHierarchy(
        // 	option.polygon.hierarchy
        // );
        const entity = addPolygon(this.viewer, option);
        this.entities.push(entity);
        const ID = entity.id;
        this.option = option;
        const extensionPoint = new Cesium.PointGraphics({
            color: this.option.color?this.option.color:Cesium.Color.YELLOW,
            pixelSize: this.option.pointSize?this.option.pointSize:8,
        });
        if (this.option.extensionPoint instanceof Cesium.PointGraphics) {
            this.option.extensionPoint.merge(extensionPoint);
        }
        else {
            this.option.extensionPoint = new Cesium.PointGraphics(this.option.extensionPoint);
            this.option.extensionPoint.merge(extensionPoint);
        }
        this.optionMap[ID] = this.option;
        this.setPeakPoint(entity);
        this.setMiddlePoint(entity);
        this.hiddenMiddlePoint(entity);
        this.hiddenPeakEntity(entity);
        // setPosition(entity, entity.polygon);
        this.drawer.emit(CesiumDrawer.EventTypeEnum.finishDraw, entity, "polygon"
        // option.polygon.hierarchy as Cesium.PolygonHierarchy
        );
        return entity;
    }
    /**
     * 改变hierarchy的规则, 查看状态关闭callback，新增和编辑则开启callback
     * @param entity 实体
     * @param Car3Arr
     */
    setCallback(entity, Car3Arr) {
        if (!(entity.polygon instanceof Cesium.PolygonGraphics))
            return;
        entity.polygon.hierarchy = new Cesium.CallbackProperty(() => new Cesium.PolygonHierarchy(Car3Arr), false);
    }
    /**
     * 改变hierarchy的规则, 查看状态关闭callback，新增和编辑则开启callback
     * @param {Cesium.Entity} entity 实体
     * @param {Array<Cesium.Cartesian3>} Car3Arr
     */
    offSetCallback(entity, Car3Arr) {
        if (!(entity.polygon instanceof Cesium.PolygonGraphics))
            return;
        const test = new Cesium.PolygonGraphics({
            hierarchy: new Cesium.PolygonHierarchy(Car3Arr),
        });
        test.merge(entity.polygon);
        entity.polygon = test;
    }
    /**
     * 绘制中间点
     * @param {Cesium.Entity} entity
     */
    setMiddlePoint(entity) {
        const ID = entity.id;
        const arr = this.pointPositions[ID];
        for (const [key, value] of arr.entries()) {
            let position;
            let E;
            if (key === arr.length - 1) {
                position = computeMiddlePoint(arr[key], arr[0]);
            }
            else {
                position = computeMiddlePoint(arr[key], arr[key + 1]);
            }
            const option = this.optionMap[ID];
            E = addPoint(this.viewer, {
                point: option.extensionPoint,
                position,
            });
            if (!this.middlePointEntities[ID])
                this.middlePointEntities[ID] = [];
            if (!this.middlePointPositions[ID])
                this.middlePointPositions[ID] = [];
            this.middlePointEntities[ID].push(E);
            this.middlePointPositions[ID].push(position);
        }
    }
    // 新增模式， 左键双击事件回调
    addLeftDoubleClick() {
        if (!("id" in this.drawer.activeEntity))
            return;
        const ID = this.drawer.activeEntity.id;
        // 如果点少于三个就双击
        if (this.pointPositions[ID].length < 3) {
            return;
        }
        this.setMiddlePoint(this.drawer.activeEntity);
        this.offSetCallback(this.drawer.activeEntity, this.pointPositions[ID]);
        this.hiddenPeakEntity(this.drawer.activeEntity);
        this.hiddenMiddlePoint(this.drawer.activeEntity);
        setPosition(this.drawer.activeEntity, this.pointPositions[ID]);
        // 双击结束新增
        this.drawer.emit(CesiumDrawer.EventTypeEnum.finishDraw, this.drawer.activeEntity, this.drawer.activeEntityType, this.pointPositions[ID]);
        this.activePointEntity = {};
        setCursorStyle("default");
        this.drawer.init();
    }
}

/**
 * 设置czml的document
 * @param viewer viewer实例
 * @param option 配置
 * @return  czml数据实例
 */
const addCzmlDocument = async function (viewer, option) {
    const document = {
        id: "document",
        name: option.name || "document",
        version: "1.0",
        clock: {
            interval: option.interval,
            currentTime: option.currentTime || Cesium.JulianDate.fromDate(new Date()).toString(),
            multiplier: option.multiplier,
            range: option.range,
            step: option.step,
        },
    };
    return await viewer.dataSources.add(Cesium.CzmlDataSource.load(document));
};
/**
 * 更新czml的document
 * @param dataSource dataSource实例
 * @param option 配置
 * @return czml数据实例
 */
const updateCzmlDocument = async function (dataSource, option) {
    if (!(dataSource instanceof Cesium.CzmlDataSource)) {
        throw new Error("expect dataSource is a instance of Cesium.CzmlDataSource");
    }
    const document = {
        id: "document",
        name: option.name || "document",
        version: "1.0",
        clock: {
            interval: option.interval,
            currentTime: option.currentTime || Cesium.JulianDate.fromDate(new Date()).toString(),
            multiplier: option.multiplier,
            range: option.range,
            step: option.step,
        },
    };
    dataSource = await dataSource.process(document);
    return dataSource;
};
/**
 * 生成卫星的配置信息
 * @param options
 */
function generateSatelliteOptions(options) {
    // 开始时间的本地时间时间戳
    const startTimeStamp = new Date(options.startTime).getTime();
    // 结束时间的本地时间时间戳
    const endTimeStamp = new Date(options.endTime).getTime();
    const daySecond = 24 * 60 * 60;
    // 每一圈的时间，单位是秒
    const roundTime = daySecond / options.round;
    // 总圈数
    const countRound = (endTimeStamp - startTimeStamp) / 1000 / roundTime;
    // 创建卫星广告牌图标
    const billboard = {
        eyeOffset: {
            cartesian: [0, 0, 0],
        },
        horizontalOrigin: "CENTER",
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAADJSURBVDhPnZHRDcMgEEMZjVEYpaNklIzSEfLfD4qNnXAJSFWfhO7w2Zc0Tf9QG2rXrEzSUeZLOGm47WoH95x3Hl3jEgilvDgsOQUTqsNl68ezEwn1vae6lceSEEYvvWNT/Rxc4CXQNGadho1NXoJ+9iaqc2xi2xbt23PJCDIB6TQjOC6Bho/sDy3fBQT8PrVhibU7yBFcEPaRxOoeTwbwByCOYf9VGp1BYI1BA+EeHhmfzKbBoJEQwn1yzUZtyspIQUha85MpkNIXB7GizqDEECsAAAAASUVORK5CYII=",
        pixelOffset: {
            cartesian2: [0, 0],
        },
        scale: 1,
        show: true,
        verticalOrigin: "CENTER",
    };
    // 创建label
    const label = {
        fillColor: {
            rgba: options.label.fillColor || [255, 255, 255, 255],
        },
        font: "21pt Lucida Console",
        horizontalOrigin: "LEFT",
        outlineColor: {
            rgba: options.label.outlineColor || [255, 255, 255, 255],
        },
        outlineWidth: 2,
        pixelOffset: {
            cartesian2: [6, -4],
        },
        scale: 0.5,
        show: true,
        style: "FILL_AND_OUTLINE",
        text: options.name,
        verticalOrigin: "CENTER",
    };
    // 创建path
    const path = {
        show: [
            {
                interval: `${options.startTime}/${options.endTime}`,
                boolean: true,
            },
        ],
        width: options.path.width || [255, 255, 255, 255],
        material: {
            solidColor: {
                color: {
                    rgba: options.path.color || [255, 255, 255, 255],
                },
            },
        },
        resolution: options.path.resolution || 60,
        leadTime: [],
        trailTime: [],
    };
    for (let I = 0; I < Math.ceil(countRound); I++) {
        // 每一圈的开始时间
        const start = Cesium.JulianDate.fromDate(new Date(startTimeStamp + I * roundTime * 1000)).toString();
        const E = I === Math.ceil(countRound) - 1
            ? endTimeStamp
            : startTimeStamp + (I + 1) * roundTime * 1000;
        // 每一圈的结束时间
        const end = Cesium.JulianDate.fromDate(new Date(E)).toString();
        path.leadTime.push({
            interval: `${start}/${end}`,
            interpolationAlgorithm: "LINEAR",
            interpolationDegree: 1,
            epoch: start,
            number: [0, roundTime, roundTime, 0],
        });
        path.trailTime.push({
            interval: `${start}/${end}`,
            interpolationAlgorithm: "LINEAR",
            interpolationDegree: 1,
            epoch: start,
            number: [0, 0, roundTime, roundTime],
        });
    }
    // 创建position
    const position = {
        interpolationAlgorithm: options.position.interpolationAlgorithm,
        interpolationDegree: options.position.interpolationDegree,
        referenceFrame: options.position.referenceFrame,
        epoch: options.startTime,
    };
    // 如果有角度集合就有角度集合
    if (options.position.degrees && options.position.degrees.length > 0) {
        position.cartographicDegrees = [];
        for (let I = 0; I < options.position.degrees.length; I++) {
            position.cartographicDegrees.push(I * options.position.step, options.position.degrees[I].longitude, options.position.degrees[I].latitude, options.position.degrees[I].height);
        }
    }
    // 如果有笛卡尔3d坐标系集合就用笛卡尔
    if (options.position.cartesian && options.position.cartesian.length > 0) {
        position.cartesian = [];
        for (let I = 0; I < options.position.cartesian.length; I++) {
            position.cartesian.push(I * options.position.step, options.position.cartesian[I].x, options.position.cartesian[I].y, options.position.cartesian[I].z);
        }
    }
    return {
        id: options.name,
        name: options.name,
        availability: `${options.startTime}/${options.endTime}`,
        billboard,
        label,
        path,
        position,
    };
}
/**
 * 添加卫星轨道,默认卫星名称就是卫星id
 * @param {Cesium.CzmlDataSource} dataSource dataSource实例
 * @param {satelliteOption} options 配置项
 * @returns {Promise<Cesium.CzmlDataSource>}
 */
const addSatellite = async function (dataSource, options) {
    dataSource = await dataSource.process(generateSatelliteOptions(options));
    return dataSource;
};
/**
 * 更新卫星轨道,会先清除轨道然后从新绘制轨道,默认卫星名称就是卫星id
 * @param {Cesium.CzmlDataSource} dataSource dataSource实例
 * @param {satelliteOption} options 配置项
 * @returns {Promise<Cesium.CzmlDataSource>}
 */
const updateSatellite = async function (dataSource, options) {
    const data = generateSatelliteOptions(options);
    dataSource.entities.removeById(data.id);
    dataSource = await dataSource.process(data);
    return dataSource;
};

/**
 * 用于参数为空的时候抛出错误
 */
/**
 * 返回一个在最小值和最大值之间的随机整数
 * @param {number} min
 * @param {number} max
 * @return {number} 随机整数
 */
function random(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
/**
 * 区分数据类型并返回其类型
 * @param {any} data 数据
 * @return {string} 数据类型
 */
function getTypeOf(data) {
    const type = Object.prototype.toString.call(data);
    return type.match(/\[object (.*?)\]/)[1].toLowerCase();
}
/**
 * 深拷贝对象或数组同时可以保留继承的属性
 * （当存在循环嵌套数据结构的时候可能会有问题！！！，例如实例的某一个属性的值是它本身，遇到嵌套的时候会跳过这个实例）
 * @param data 需要被拷贝的数据
 * @return 深拷贝结果
 */
function deepClone(data) {
    if (data === null)
        return data;
    if (!Array.isArray(data) && typeof data !== "object")
        return data;
    // 返回的结果
    let result;
    // 保存已经拷贝过的数据
    const cache = new WeakMap();
    // 数据堆栈
    const stack = [
        {
            data,
            key: undefined,
            target: result,
        },
    ];
    while (stack.length > 0) {
        const node = stack.pop();
        if (Array.isArray(node.data)) {
            // 表示最高级
            if (node.key === undefined) {
                result = [];
                node.target = result;
            }
            else {
                node.target[node.key] = [];
                node.target = node.target[node.key];
            }
            Object.setPrototypeOf(node.target, Object.getPrototypeOf(node.data));
            for (const [index, value] of node.data.entries()) {
                const cacheNode = cache.get(value);
                if (cacheNode === index)
                    continue;
                stack.push({
                    data: value,
                    key: index,
                    target: node.target,
                });
            }
            cache.set(node.data, node.key);
        }
        else if (typeof node.data === "object" && node.data !== null) {
            // 表示最高级
            if (node.key === undefined) {
                result = {};
                node.target = result;
            }
            else {
                node.target[node.key] = {};
                node.target = node.target[node.key];
            }
            // if (!(typeof node.target === "object" && node.target !== null)) continue;
            Object.setPrototypeOf(node.target, Object.getPrototypeOf(node.data));
            for (const dataKey in node.data) {
                if (!Object.prototype.hasOwnProperty.call(node.data, dataKey))
                    continue;
                const index = dataKey;
                const value = node.data[dataKey];
                const cacheNode = cache.get(value);
                if (cacheNode === index)
                    continue;
                stack.push({
                    data: value,
                    key: index,
                    target: node.target,
                });
            }
            cache.set(node.data, node.key);
        }
        else {
            if (node.key === undefined)
                continue;
            node.target[node.key] = node.data;
        }
    }
    return result;
}
/**
 * 合并对象和数组的方法，深层合并对象，origin的属性会覆盖target的属性；如果对象中嵌套对象，会导致深层的对象被覆盖，这个方法会保留深层对象，并且进行合并
 * （合并存在相互嵌套的数据结构时会有问题！！！比如实例的某一个属性的值是他本身，这个时候会跳过）
 * @param target 如果target的属性和origin重复，origin的属性会覆盖target的属性。不会修改target的属性
 * @param origin origin上的属性会合并入target
 * @return 合并的结果
 */
function merge(target, origin) {
    if (target === null || origin === null)
        return target;
    const targetType = getTypeOf(target);
    const originType = getTypeOf(origin);
    // 如果参数类型不一致直接返回target
    if (targetType !== originType)
        return target;
    if (!(Array.isArray(target) || (typeof target === "object" && target !== null)))
        return target;
    // 遍历堆栈
    const stack = [
        {
            data: origin,
            key: undefined,
            target,
        },
    ];
    // 缓存遍历过的数据（因为基本数据类型直接覆盖，在stack里面的data都是复杂数据类型，所以只缓存复杂数据类型）
    const cache = new WeakMap();
    while (stack.length > 0) {
        const node = stack.pop();
        if (Array.isArray(node.data) && Array.isArray(node.target)) {
            if (node.key !== undefined &&
                node.target[node.key] === undefined) {
                node.target[node.key] = [];
                Object.setPrototypeOf(node.target[node.key], Object.getPrototypeOf(node.data));
            }
            if (node.key === undefined) {
                Object.setPrototypeOf(node.target, Object.getPrototypeOf(node.data));
            }
            for (const [index, value] of node.data.entries()) {
                // 如果已经复制过了则跳过
                if (cache.get(value) === index)
                    continue;
                stack.push({
                    data: value,
                    key: index,
                    target: node.key === undefined
                        ? node.target
                        : node.target[node.key],
                });
            }
            cache.set(node.data, node.key);
        }
        else if (typeof node.data === "object" &&
            node.data !== null &&
            typeof node.target === "object" &&
            node.target !== null) {
            if (node.key !== undefined && node.target[node.key] === undefined) {
                node.target[node.key] = {};
                Object.setPrototypeOf(node.target[node.key], Object.getPrototypeOf(node.data));
            }
            if (node.key === undefined) {
                Object.setPrototypeOf(node.target, Object.getPrototypeOf(node.data));
            }
            for (const dataKey in node.data) {
                // 首先判读属性是否存在于实例本身
                if (!Object.prototype.hasOwnProperty.call(node.data, dataKey))
                    continue;
                const index = dataKey;
                const value = node.data[dataKey];
                if (cache.get(value) === index)
                    continue;
                stack.push({
                    data: value,
                    key: index,
                    target: node.key === undefined ? node.target : node.target[node.key],
                });
            }
            cache.set(node.data, node.key);
        }
        else {
            if (node.key === undefined)
                continue;
            // 如果原始值存在有效值，而被合并入的值是无效值则保留原始值
            if (node.data === undefined && node.target[node.key] !== undefined)
                continue;
            node.target[node.key] = node.data;
        }
    }
    return target;
}

const global = new Global();
/**
 * cesium-drawer地图标绘
 */
class CesiumDrawer {
    /**
     * @param viewer cesium的viewer实例
     * @param option 可选项
     */
    constructor(viewer, option) {
        /**
         * 状态有add，view，edit
         * @deprecated
         * 下个版本移除，采用global中的全局交互状态
         */
        this.drawerStatus = "view";
        /**
         * 保存当前活跃的实体
         * @deprecated
         * 下个版本移除，采用global中的全局活跃实体
         */
        this.activeEntity = {};
        /**
         * 保存当前活跃的实体类型
         * @deprecated
         * 下个版本移除，采用global中的全局活跃实体类型
         */
        this.activeEntityType = CesiumDrawer.EntityTypeEnum.initial;
        /**
         * 事件队列
         * @private
         */
        this.eventQueue = []; // 事件队列

        this.savedEntities=[];
        this.lat_long = [];
        this.viewer = viewer;
        // 给viewer实例绑定状态。
        // 因为所有的绘制状态都是基于整个cesium实例而言的。全局可以用
        this.classMap = {
            initial: new Initial(viewer, this),
            point: new Point(viewer, this),
            polygon: new Polygon(viewer, this),
            polyline: new Polyline(viewer, this),
        };
        this.global = global;
        global.registerDrawer(viewer, this, option);
        // 设置事件处理器
        this.setHandler();
        this.init();
    }
    /**
     * 订阅事件
     * @param event 事件类型
     * @param callback 回调函数
     */
    on(event, callback) {
        // 去除重复的事件
        // 每个事件只能有唯一的订阅者（看需求，如果需要多订阅者，把下面这一行注释调就行了）。
        this.eventQueue = this.eventQueue.filter((item) => item.event !== event);
        // 事件队列中放入事件
        this.eventQueue.push({
            event,
            callback,
        });
    }
    /**
     * 发布事件
     * @param event 事件类型
     * @param params 传递出的参数
     */
    async emit(event, ...params) {
        // 筛选出需要调用的事件
        const res = this.eventQueue.find((item) => item.event === event);
        if (res) {
            // 如果回调返回的不是false一律返回true
            // 支持异步函数
            const R = await res.callback(...params);
            return R !== false;
        }
        return true;
    }
    /**
     * 初始化draw
     * @param {"add" | "edit" | "view"} status 要基于这个状态来注册drawer的行为模式
     * @param {Cesium.Entity | {}} entity
     * @param {EntityType | "initial"} entityType
     */
    init(status = "view", entity = {}, entityType = CesiumDrawer.EntityTypeEnum.initial) {
        this.drawerStatus = status;
        this.activeEntity = entity;
        this.activeEntityType = entityType;
        this.graph = this.classMap[entityType];
        global.setGlobalStatus(status);
        // 保存活跃的drawer
        global.activeDrawer = this;
        this.registerEvent();
    }
    /**
     * 开始绘制图形, 用于鼠标点选
     * @param option 配置参数
     */
    startDraw(option) {
        if (!["polyline", "Circle", "rectangle", "polygon", "point"].includes(option.type)) {
            throw new Error("type is required");
        }
        const { activeDrawer } = this.global;
        // 边界处理，如果当前正在绘制某个实体，则取消绘制
        if (activeDrawer.drawerStatus === "add") {
            activeDrawer.classMap[activeDrawer.activeEntityType].cancelDraw();
        }
        // 边界处理，如果当前正在编辑某个实体，则完成编辑
        if (activeDrawer.drawerStatus === "edit") {
            activeDrawer.classMap[activeDrawer.activeEntityType].finishEdit();
        }
        this.graph = this.classMap[option.type];
        this.graph.startDraw(option);
    }
    /**
     * 开始编辑
     * @param entity 实体
     * @param entityType 实体类型
     */
    startEdit(entity, entityType) {
        const { drawer, entityType: ENTITY_TYPE } = this.global.findDrawer(entity);
        // 如果传入的实体类型不等于检测的实体类型则赋值检测出的实体类型
        entityType = ENTITY_TYPE;
        // 如果赋值之后实体类型仍然为undefined，则表示实体不是本仓库创建的，则不支持开始编辑。
        if (!entityType)
            throw new ReferenceError("This entity was not created by CesiumDrawer and does not support editing");
        if (!drawer)
            return;
        // 边界处理，如果当前正在绘制某个实体，则取消绘制
        const { activeDrawer } = this.global;
        if (activeDrawer.drawerStatus === "add") {
            activeDrawer.classMap[activeDrawer.activeEntityType].cancelDraw();
        }
        // 边界处理，如果当前正在编辑某个实体，则完成编辑
        if (activeDrawer.drawerStatus === "edit") {
            activeDrawer.classMap[activeDrawer.activeEntityType].finishEdit();
        }
        // 重置所有drawer的状态
        this.global.initAllDrawer();
        // 目标drawer开始绘制
        this.graph = drawer.classMap[entityType];
        this.graph.startEdit(entity, entityType);
        this.logoutLeftClick();
    }
    /**
     * 增加根据类型以及坐标直接绘制图形的方法
     * @param option 配置
     */
    draw(option) {
        if (!["polyline", "Circle", "rectangle", "polygon", "point"].includes(option.type)) {
            throw new Error("type is required");
        }
        this.graph = this.classMap[option.type];
        return this.graph.draw(option);
    }
    /**
     * 删除指定实体
     * @param entity 实体
     */
    delete(entity) {
        if (!entity)
            throw new Error("entity is required");
        const { drawer, entityType } = this.global.findDrawer(entity);
        if (!entityType) {
            console.warn("entity is not spawn by CesiumDrawer");
            this.viewer.entities.remove(entity);
            return;
        }
        drawer.graph = drawer.classMap[entityType];
        drawer.graph.deleteEntity(entity);
    }
    /**
     * 插入节点，生成一个实体作为传入实体的节点
     * @param {Cesium.Entity} entity 需要被插入节点的实体
     * @param {number?} index 索引，如果不传或者传入的值大于实体节点则都会在末尾增加一个节点
     * @param {object?} option 配置
     * @param {boolean?} option.show 是否展示
     * @param {Cesium.Cartesian3} option.position 位置
     * @param {Cesium.PointGraphics?} option.point 点的配置，详细参数请参考cesium api文档。
     * @param {Cesium.BillboardGraphics} option.billboard 广告牌的配置。
     * @param {Cesium.LabelGraphics} option.label label配置。
     */
    // insertNode(entity: Cesium.Entity, index: number, option: DrawPoint) {
    // 	const res = Drawer.isControlNodeEntity(entity);
    // 	if (!res) return;
    // 	if (res.drawer !== this) {
    // 		return res.drawer.insertNode(entity, index, option);
    // 	}
    // 	return this.classMap[res.entityType].insertNode(entity, index, option);
    // }
    /**
     * 更新已有节点，生成一个实体作为传入实体的节点
     * @param {Cesium.Entity} entity 需要被更新节点的实体
     * @param {number} index 索引，如果传入的索引无法获取到节点的实体则不会有任何反应
     * @param {object?} option 配置
     * @param {boolean?} option.show 是否展示
     * @param {Cesium.Cartesian3} option.position 位置
     * @param {Cesium.PointGraphics?} option.point 点的配置，详细参数请参考cesium api文档。
     * @param {Cesium.BillboardGraphics} option.billboard 广告牌的配置。
     * @param {Cesium.LabelGraphics} option.label label配置。
     */
    // updateNode(entity, index, option) {
    // 	const res = Drawer.isControlNodeEntity(entity);
    // 	if (!res) return;
    // 	if (res.drawer !== this) {
    // 		return res.drawer.updateNode(entity, index, option);
    // 	}
    // 	return this.classMap[res.entityType].updateNode(entity, index, option);
    // }
    /**
     * 删除已有节点，生成一个实体作为传入实体的节点
     * @param {Cesium.Entity} entity 需要被删除节点的实体
     * @param {number?} index 索引，如果不传或者传入的值大于实体节点列表的最大值，则会删除最后一个节点
     */
    // deleteNode(entity, index) {
    // 	const res = Drawer.isControlNodeEntity(entity);
    // 	if (!res) return;
    // 	if (res.drawer !== this) return res.drawer.deleteNode(entity, index);
    // 	return this.classMap[res.entityType].deleteNode(entity, index);
    // }
    /**
     * 获取已有节点，生成一个实体作为传入实体的节点
     * @param {Cesium.Entity} entity 需要被获取节点的实体
     * @param {number?} index 索引，如果不传则会获取所有的节点, 如果传入的索引大于拥有的节点数量，则会返回最后一个节点
     */
    // getNode(entity, index) {
    // 	const res = Drawer.isControlNodeEntity(entity);
    // 	if (!res) return;
    // 	if (res.drawer !== this) return res.drawer.getNode(entity, index);
    // 	return this.classMap[res.entityType].getNode(entity, index);
    // }
    /**
     * 获取已有节点的坐标
     * @param {Cesium.Entity} entity 需要被获取节点坐标的实体
     */
    // getNodePositions(entity) {
    // 	const res = Drawer.isControlNodeEntity(entity);
    // 	if (!res) return;
    // 	if (res.drawer !== this) return res.drawer.getNodePositions(entity);
    // 	return this.classMap[res.entityType].getNodePositions(entity);
    // }
    /**
     * 判断实体的节点是否可以被操作
     * @param {Cesium.Entity} entity 要判断实体的节点是否可以被操作的实体
     * @return {EntityFrom} 实体来源和类型
     */
    // static isControlNodeEntity(entity: Cesium.Entity): EntityFrom {
    // 	const supportedEntityType = ["polyline", "polygon"];
    // 	const res = global.findDrawer(entity);
    // 	if (!res) throw new Error("当前实体不可操作");
    // 	if (!supportedEntityType.includes(res.entityType as EntityType)) {
    // 		throw new Error("当前实体类型不支持操作");
    // 	}
    // 	return res;
    // }
    // 获取节点 1. 线面等实体，2. 实体类型？3. 需要增加点的位置索引从零开始。4. 插入的点的属性位置等信息
    // 获取所有节点实体
    // 获取所有节点坐标
    // 设置事件处理器
    setHandler() {
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas); // 创建事件监听器
    }
    /**
     * 注册事件
     * @private
     * @param {"add" | "edit" | "view"} status
     * @param {EntityType | "initial"} entityType
     */
    registerEvent(status = this.drawerStatus, entityType = this.activeEntityType) {
        this.registerLeftClick(status, entityType);
        this.registerMouseMove(status, entityType);
        this.registerLeftDown(status, entityType);
        this.registerLeftUp(status, entityType);
        this.registerRightClick(status, entityType);
        this.registerLeftDoubleClick(status, entityType);
    }
    // 注销事件
    logoutEvent() {
        this.logoutLeftClick();
        this.logoutLeftDown();
        this.logoutLeftUp();
        this.logoutMouseMove();
        this.logoutRightClick();
        this.logoutLeftDoubleClick();
    }
    /**
     * 注册鼠标左键按下
     * @param status drawer状态
     * @param entityType 实体类型
     */
    registerLeftDown(status, entityType) {
        const fun = () => { };
        // if (entityType !== "initial" && entityType !== "point") return;
        this.handler.setInputAction((this.graph.methodsMap[status].leftDown || fun).bind(this.graph), Cesium.ScreenSpaceEventType.LEFT_DOWN);
    }
    /**
     * 注册鼠标左键松开事件监听
     * @param {"add" | "edit" | "view"} status
     * @param {EntityType | "initial"} entityType
     */
    registerLeftUp(status, entityType) {
        const fun = () => { };
        // if (entityType !== "initial" && entityType !== "point") return;
        this.handler.setInputAction((this.graph.methodsMap[status].leftUp || fun).bind(this.graph), Cesium.ScreenSpaceEventType.LEFT_UP);
    }
    /**
     * 注册鼠标左键点击事件监听
     * @param {"add" | "edit" | "view"} status
     * @param {EntityType | "initial"} entityType
     */
    registerLeftClick(status, entityType) {
        const fun = () => { };
        // if (entityType !== "initial" && entityType !== "point") return;
        this.handler.setInputAction(
        // 需要用bind指定当前实例
        (this.graph.methodsMap[status].leftClick || fun).bind(this.graph), Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    /**
     * 注册鼠标移动事件
     * @param {"add" | "edit" | "view"} status
     * @param {EntityType | "initial"} entityType
     */
    registerMouseMove(status, entityType) {
        const fun = () => { };
        // if (entityType !== "initial" && entityType !== "point") return;
        this.handler.setInputAction((this.graph.methodsMap[status].mouseMove || fun).bind(this.graph), Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    /**
     * 注册鼠标右键点击事件
     * @param {"add" | "edit" | "view"} status
     * @param {EntityType | "initial"} entityType
     */
    registerRightClick(status, entityType) {
        const fun = () => { };
        // if (entityType !== "initial" && entityType !== "point") return;
        this.handler.setInputAction((this.graph.methodsMap[status].rightClick || fun).bind(this.graph), Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    /**
     * 注册鼠标右键双击事件
     * @param {"add" | "edit" | "view"} status
     * @param {EntityType | "initial"} entityType
     */
    registerLeftDoubleClick(status, entityType) {
        const fun = () => { };
        // if (entityType !== "initial" && entityType !== "point") return;
        this.handler.setInputAction((this.graph.methodsMap[status].leftDoubleClick || fun).bind(this.graph), Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
    // 注销鼠标左键按下
    logoutLeftDown() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
    }
    // 注销鼠标左键松开
    logoutLeftUp() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
    }
    // 注销鼠标左键点击
    logoutLeftClick() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }
    // 注销鼠标移动
    logoutMouseMove() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }
    // 注销鼠标右键点击
    logoutRightClick() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }
    // 注销鼠标左键双击
    logoutLeftDoubleClick() {
        this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    }
   finishEditing(){
    this.global.activeDrawer.classMap[this.global.activeDrawer.activeEntityType].finishEdit();
   }

  
}

CesiumDrawer.diffEntityType = diffEntityType;
CesiumDrawer.Car2ToCar3 = Car2ToCar3;
CesiumDrawer.Car3toDegrees = Car3toDegrees;
CesiumDrawer.getCenterPoint = getCenterPoint;
CesiumDrawer.setLabel = setLabel;
CesiumDrawer.setBillboard = setBillboard;
CesiumDrawer.svgToImage = svgToImage;
CesiumDrawer.addCzmlDocument = addCzmlDocument;
CesiumDrawer.updateCzmlDocument = updateCzmlDocument;
CesiumDrawer.addSatellite = addSatellite;
CesiumDrawer.updateSatellite = updateSatellite;
CesiumDrawer.random = random;
CesiumDrawer.merge = merge;
CesiumDrawer.getTypeOf = getTypeOf;
CesiumDrawer.deepClone = deepClone;
CesiumDrawer.addPoint = addPoint;
CesiumDrawer.addPolyline = addPolyline;
CesiumDrawer.addPolygon = addPolygon;
CesiumDrawer.openFixedRotation = openFixedRotation;
CesiumDrawer.closeFixedRotation = closeFixedRotation;
CesiumDrawer.EntityTypeEnum = EntityTypeEnum;
CesiumDrawer.EventTypeEnum = EventTypeEnum;

export { CesiumDrawer as default };
