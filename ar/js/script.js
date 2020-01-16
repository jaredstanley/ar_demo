//////////////////////////////////////////////////////////////////////////////////
  //    Init
  //////////////////////////////////////////////////////////////////////////////////

  // init renderer

  var renderer  = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(new THREE.Color('lightgrey'), 0)
  renderer.setSize( 640, 480 );
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.top = '0px'
  renderer.domElement.style.left = '0px'
  document.body.appendChild( renderer.domElement );

  // array of functions for the rendering loop
  var onRenderFcts= [];

  // init scene and camera
  var scene = new THREE.Scene();

  //////////////////////////////////////////////////////////////////////////////////
  //    Initialize a basic camera
  //////////////////////////////////////////////////////////////////////////////////

  // Create a camera
  var camera = new THREE.Camera();
  scene.add(camera);

  ////////////////////////////////////////////////////////////////////////////////
  //          handle arToolkitSource
  ////////////////////////////////////////////////////////////////////////////////

  var arToolkitSource = new THREEx.ArToolkitSource({
    // to read from the webcam
    sourceType : 'webcam',

    // // to read from an image
    // sourceType : 'image',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',

    // to read from a video
    // sourceType : 'video',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
  })

  arToolkitSource.init(function onReady(){
    // handle resize of renderer
    arToolkitSource.onResize(renderer.domElement)
  })

  // handle resize
  window.addEventListener('resize', function(){
    // handle arToolkitSource resize
    arToolkitSource.onResize(renderer.domElement)
  })
  ////////////////////////////////////////////////////////////////////////////////
  //          initialize arToolkitContext
  ////////////////////////////////////////////////////////////////////////////////


  // create atToolkitContext
  var arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'img/camera_para.dat',
    // cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
    detectionMode: 'mono',
  })
  // initialize it
  arToolkitContext.init(function onCompleted(){
    // copy projection matrix to camera
    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
  })

  // update artoolkit on every frame
  onRenderFcts.push(function(){
    if( arToolkitSource.ready === false ) return

    arToolkitContext.update( arToolkitSource.domElement )

    // update scene.visible if the marker is seen
    scene.visible = camera.visible
  })

  ////////////////////////////////////////////////////////////////////////////////
  //          Create a ArMarkerControls
  ////////////////////////////////////////////////////////////////////////////////

  // init controls for camera
  var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type : 'pattern',
    // patternUrl : 'img/patt.hiro',
    patternUrl : 'img/patt.puremarker',
    // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro',
    // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
    // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
    changeMatrixMode: 'cameraTransformMatrix'
  })
  // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
  scene.visible = false


  initObjects();
  initTextures();
  initLights();
  onRenderFcts.push(function(delta){
    wheel.rotation.y += Math.PI*delta;
  })

  function initObjects(){
  var loader = new THREE.JSONLoader(); // init the loader util

  loader.load('img/wheel.js', function (geometry) {
    console.log("loaded");
      wheel = new THREE.Mesh(geometry,subjMat);
      wheel.name = "wheel";
      wheel.scale.set(0.001,0.001,0.001);
      geometry.center();
      scene.add(wheel);
  });
  //
  loader.load('img/base.js', function (geometry) {

      base = new THREE.Mesh(geometry,baseMat);
      base.position.z = -0.39;
      base.position.y = 0.128;
      // base.position.z = -1560;
      // base.position.y = 521;
      base.scale.set(0.001,0.001,0.001);

      geometry.center();
      scene.add(base);
  });
}

function initTextures(){
    subjMat = new THREE.MeshPhongMaterial({
    color:0xffffff,
    shading: THREE.FlatShading
    });
    subjMat.map = THREE.ImageUtils.loadTexture('img/wheel.jpg');
    baseMat = new THREE.MeshPhongMaterial({
    color:0xffffff,
    shading: THREE.FlatShading
    });
    baseMat.map = THREE.ImageUtils.loadTexture('img/base.jpg');


}


function initLights(){
  light1 = new THREE.PointLight(0x999999);
  light1.position.set(2133,3111,111);

  scene.add(light1);

  light2 = new THREE.PointLight(0xffffff);
  light2.position.set(500,1470,2310);

  scene.add(light2);


}
  //////////////////////////////////////////////////////////////////////////////////
  //    render the whole thing on the page
  //////////////////////////////////////////////////////////////////////////////////

  // render the scene
  onRenderFcts.push(function(){
      // wheel.rotation.z -= 0.02

    renderer.render( scene, camera );
  })

  // run the rendering loop
  var lastTimeMsec= null
  requestAnimationFrame(function animate(nowMsec){
    // keep looping
    requestAnimationFrame( animate );
    // measure time
    lastTimeMsec  = lastTimeMsec || nowMsec-1000/60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec  = nowMsec
    // call each update function
    onRenderFcts.forEach(function(onRenderFct){
      onRenderFct(deltaMsec/1000, nowMsec/1000)
    })
  })
