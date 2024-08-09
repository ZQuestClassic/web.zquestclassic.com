
  var Module = typeof Module != 'undefined' ? Module : {};

  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }

  Module.expectedDataFileDownloads++;
  (() => {
    // Do not attempt to redownload the virtual filesystem data when in a pthread or a Wasm Worker context.
    var isPthread = typeof ENVIRONMENT_IS_PTHREAD != 'undefined' && ENVIRONMENT_IS_PTHREAD;
    var isWasmWorker = typeof ENVIRONMENT_IS_WASM_WORKER != 'undefined' && ENVIRONMENT_IS_WASM_WORKER;
    if (isPthread || isWasmWorker) return;
    function loadPackage(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = '/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Debug/zscript.data';
      var REMOTE_PACKAGE_BASE = 'zscript.data';
      if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
        Module['locateFile'] = Module['locateFilePackage'];
        err('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
      }
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', packageName, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = function(event) {
          var url = packageName;
          var size = packageSize;
          if (event.total) size = event.total;
          if (event.loaded) {
            if (!xhr.addedTotal) {
              xhr.addedTotal = true;
              if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
              Module.dataFileDownloads[url] = {
                loaded: event.loaded,
                total: size
              };
            } else {
              Module.dataFileDownloads[url].loaded = event.loaded;
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++;
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads/num);
            Module['setStatus']?.(`Downloading data... (${loaded}/${total})`);
          } else if (!Module.dataFileDownloads) {
            Module['setStatus']?.('Downloading data...');
          }
        };
        xhr.onerror = function(event) {
          throw new Error("NetworkError for: " + packageName);
        }
        xhr.onload = function(event) {
          if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
          } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
          }
        };
        xhr.send(null);
      };

      function handleError(error) {
        console.error('package error:', error);
      };

    function runWithFS(Module) {

      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
Module['FS_createPath']("/", "base_config", true, true);
Module['FS_createPath']("/", "headers", true, true);
Module['FS_createPath']("/headers", "examples", true, true);
Module['FS_createPath']("/headers", "ghost_zh", true, true);
Module['FS_createPath']("/headers/ghost_zh", "2.8", true, true);
Module['FS_createPath']("/headers", "gui_zh", true, true);
Module['FS_createPath']("/headers", "tango", true, true);
Module['FS_createPath']("/headers/tango", "1.3", true, true);
Module['FS_createPath']("/headers/tango", "font", true, true);
Module['FS_createPath']("/", "include", true, true);
Module['FS_createPath']("/include", "bindings", true, true);
Module['FS_createPath']("/include", "deprecated", true, true);
Module['FS_createPath']("/include", "std_zh", true, true);
Module['FS_createPath']("/include/std_zh", "string", true, true);

      /** @constructor */
      function DataRequest(start, end, audio) {
        this.start = start;
        this.end = end;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module['addRunDependency'](`fp ${this.name}`);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);
          this.finish(byteArray);
        },
        finish: function(byteArray) {
          var that = this;
          // canOwn this data in the filesystem, it is a slide into the heap that will never change
          Module['FS_createDataFile'](this.name, null, byteArray, true, true, true);
          Module['removeRunDependency'](`fp ${that.name}`);
          this.requests[this.name] = null;
        }
      };

      var files = metadata['files'];
      for (var i = 0; i < files.length; ++i) {
        new DataRequest(files[i]['start'], files[i]['end'], files[i]['audio'] || 0).open('GET', files[i]['filename']);
      }

        var PACKAGE_UUID = metadata['package_uuid'];
        var indexedDB;
        if (typeof window === 'object') {
          indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        } else if (typeof location !== 'undefined') {
          // worker
          indexedDB = self.indexedDB;
        } else {
          throw 'using IndexedDB to cache data can only be done on a web page or in a web worker';
        }
        var IDB_RO = "readonly";
        var IDB_RW = "readwrite";
        var DB_NAME = "EM_PRELOAD_CACHE";
        var DB_VERSION = 1;
        var METADATA_STORE_NAME = 'METADATA';
        var PACKAGE_STORE_NAME = 'PACKAGES';
        function openDatabase(callback, errback) {
          try {
            var openRequest = indexedDB.open(DB_NAME, DB_VERSION);
          } catch (e) {
            return errback(e);
          }
          openRequest.onupgradeneeded = function(event) {
            var db = /** @type {IDBDatabase} */ (event.target.result);

            if (db.objectStoreNames.contains(PACKAGE_STORE_NAME)) {
              db.deleteObjectStore(PACKAGE_STORE_NAME);
            }
            var packages = db.createObjectStore(PACKAGE_STORE_NAME);

            if (db.objectStoreNames.contains(METADATA_STORE_NAME)) {
              db.deleteObjectStore(METADATA_STORE_NAME);
            }
            var metadata = db.createObjectStore(METADATA_STORE_NAME);
          };
          openRequest.onsuccess = function(event) {
            var db = /** @type {IDBDatabase} */ (event.target.result);
            callback(db);
          };
          openRequest.onerror = function(error) {
            errback(error);
          };
        };

        // This is needed as chromium has a limit on per-entry files in IndexedDB
        // https://cs.chromium.org/chromium/src/content/renderer/indexed_db/webidbdatabase_impl.cc?type=cs&sq=package:chromium&g=0&l=177
        // https://cs.chromium.org/chromium/src/out/Debug/gen/third_party/blink/public/mojom/indexeddb/indexeddb.mojom.h?type=cs&sq=package:chromium&g=0&l=60
        // We set the chunk size to 64MB to stay well-below the limit
        var CHUNK_SIZE = 64 * 1024 * 1024;

        function cacheRemotePackage(
          db,
          packageName,
          packageData,
          packageMeta,
          callback,
          errback
        ) {
          var transactionPackages = db.transaction([PACKAGE_STORE_NAME], IDB_RW);
          var packages = transactionPackages.objectStore(PACKAGE_STORE_NAME);
          var chunkSliceStart = 0;
          var nextChunkSliceStart = 0;
          var chunkCount = Math.ceil(packageData.byteLength / CHUNK_SIZE);
          var finishedChunks = 0;
          for (var chunkId = 0; chunkId < chunkCount; chunkId++) {
            nextChunkSliceStart += CHUNK_SIZE;
            var putPackageRequest = packages.put(
              packageData.slice(chunkSliceStart, nextChunkSliceStart),
              `package/${packageName}/${chunkId}`
            );
            chunkSliceStart = nextChunkSliceStart;
            putPackageRequest.onsuccess = function(event) {
              finishedChunks++;
              if (finishedChunks == chunkCount) {
                var transaction_metadata = db.transaction(
                  [METADATA_STORE_NAME],
                  IDB_RW
                );
                var metadata = transaction_metadata.objectStore(METADATA_STORE_NAME);
                var putMetadataRequest = metadata.put(
                  {
                    'uuid': packageMeta.uuid,
                    'chunkCount': chunkCount
                  },
                  `metadata/${packageName}`
                );
                putMetadataRequest.onsuccess = function(event) {
                  callback(packageData);
                };
                putMetadataRequest.onerror = function(error) {
                  errback(error);
                };
              }
            };
            putPackageRequest.onerror = function(error) {
              errback(error);
            };
          }
        }

        /* Check if there's a cached package, and if so whether it's the latest available */
        function checkCachedPackage(db, packageName, callback, errback) {
          var transaction = db.transaction([METADATA_STORE_NAME], IDB_RO);
          var metadata = transaction.objectStore(METADATA_STORE_NAME);
          var getRequest = metadata.get(`metadata/${packageName}`);
          getRequest.onsuccess = function(event) {
            var result = event.target.result;
            if (!result) {
              return callback(false, null);
            } else {
              return callback(PACKAGE_UUID === result['uuid'], result);
            }
          };
          getRequest.onerror = function(error) {
            errback(error);
          };
        }

        function fetchCachedPackage(db, packageName, metadata, callback, errback) {
          var transaction = db.transaction([PACKAGE_STORE_NAME], IDB_RO);
          var packages = transaction.objectStore(PACKAGE_STORE_NAME);

          var chunksDone = 0;
          var totalSize = 0;
          var chunkCount = metadata['chunkCount'];
          var chunks = new Array(chunkCount);

          for (var chunkId = 0; chunkId < chunkCount; chunkId++) {
            var getRequest = packages.get(`package/${packageName}/${chunkId}`);
            getRequest.onsuccess = function(event) {
              if (!event.target.result) {
                errback(new Error(`CachedPackageNotFound for: ${packageName}`));
                return;
              }
              // If there's only 1 chunk, there's nothing to concatenate it with so we can just return it now
              if (chunkCount == 1) {
                callback(event.target.result);
              } else {
                chunksDone++;
                totalSize += event.target.result.byteLength;
                chunks.push(event.target.result);
                if (chunksDone == chunkCount) {
                  if (chunksDone == 1) {
                    callback(event.target.result);
                  } else {
                    var tempTyped = new Uint8Array(totalSize);
                    var byteOffset = 0;
                    for (var chunkId in chunks) {
                      var buffer = chunks[chunkId];
                      tempTyped.set(new Uint8Array(buffer), byteOffset);
                      byteOffset += buffer.byteLength;
                      buffer = undefined;
                    }
                    chunks = undefined;
                    callback(tempTyped.buffer);
                    tempTyped = undefined;
                  }
                }
              }
            };
            getRequest.onerror = function(error) {
              errback(error);
            };
          }
        }

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        // Reuse the bytearray from the XHR as the source for file reads.
          DataRequest.prototype.byteArray = byteArray;
          var files = metadata['files'];
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }          Module['removeRunDependency']('datafile_/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Debug/zscript.data');

      };
      Module['addRunDependency']('datafile_/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Debug/zscript.data');

      if (!Module.preloadResults) Module.preloadResults = {};

        function preloadFallback(error) {
          console.error(error);
          console.error('falling back to default preload behavior');
          fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, processPackageData, handleError);
        };

        openDatabase(
          function(db) {
            checkCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME,
              function(useCached, metadata) {
                Module.preloadResults[PACKAGE_NAME] = {fromCache: useCached};
                if (useCached) {
                  fetchCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME, metadata, processPackageData, preloadFallback);
                } else {
                  fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE,
                    function(packageData) {
                      cacheRemotePackage(db, PACKAGE_PATH + PACKAGE_NAME, packageData, {uuid:PACKAGE_UUID}, processPackageData,
                        function(error) {
                          console.error(error);
                          processPackageData(packageData);
                        });
                    }
                  , preloadFallback);
                }
              }
            , preloadFallback);
          }
        , preloadFallback);

        Module['setStatus']?.('Downloading...');

    }
    if (Module['calledRun']) {
      runWithFS(Module);
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/base_config/zscript.cfg", "start": 0, "end": 252}, {"filename": "/headers/examples/gui_example.zs", "start": 252, "end": 3978}, {"filename": "/headers/examples/tango_example.zh", "start": 3978, "end": 8961}, {"filename": "/headers/ghost.zh", "start": 8961, "end": 16064}, {"filename": "/headers/ghost_zh/2.8/changelog.txt", "start": 16064, "end": 27032}, {"filename": "/headers/ghost_zh/2.8/ghost2_common.zh", "start": 27032, "end": 30452}, {"filename": "/headers/ghost_zh/2.8/ghost2_deprecated.zh", "start": 30452, "end": 36470}, {"filename": "/headers/ghost_zh/2.8/ghost2_drawing.zh", "start": 36470, "end": 42870}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweapon.zh", "start": 42870, "end": 71561}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweaponDeath.zh", "start": 71561, "end": 79234}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweaponMovement.zh", "start": 79234, "end": 93108}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental.zh", "start": 93108, "end": 94166}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental2.zh", "start": 94166, "end": 95229}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental_movement.zh", "start": 95229, "end": 97282}, {"filename": "/headers/ghost_zh/2.8/ghost2_flags.zh", "start": 97282, "end": 99909}, {"filename": "/headers/ghost_zh/2.8/ghost2_global.zh", "start": 99909, "end": 109288}, {"filename": "/headers/ghost_zh/2.8/ghost2_init.zh", "start": 109288, "end": 116760}, {"filename": "/headers/ghost_zh/2.8/ghost2_init_bugged.zh", "start": 116760, "end": 121616}, {"filename": "/headers/ghost_zh/2.8/ghost2_modification.zh", "start": 121616, "end": 125764}, {"filename": "/headers/ghost_zh/2.8/ghost2_movement.zh", "start": 125764, "end": 157797}, {"filename": "/headers/ghost_zh/2.8/ghost2_other.zh", "start": 157797, "end": 176129}, {"filename": "/headers/ghost_zh/2.8/ghost2_scripts.zs", "start": 176129, "end": 176618}, {"filename": "/headers/ghost_zh/2.8/ghost2_update.zh", "start": 176618, "end": 199444}, {"filename": "/headers/ghost_zh/2.8/ghost_experimental.zh", "start": 199444, "end": 199669}, {"filename": "/headers/gui.zh", "start": 199669, "end": 201172}, {"filename": "/headers/gui_zh/guizh_button.zh", "start": 201172, "end": 202909}, {"filename": "/headers/gui_zh/guizh_checkbox.zh", "start": 202909, "end": 204868}, {"filename": "/headers/gui_zh/guizh_common.zh", "start": 204868, "end": 205083}, {"filename": "/headers/gui_zh/guizh_event.zh", "start": 205083, "end": 205896}, {"filename": "/headers/gui_zh/guizh_label.zh", "start": 205896, "end": 206703}, {"filename": "/headers/gui_zh/guizh_main.zh", "start": 206703, "end": 211983}, {"filename": "/headers/gui_zh/guizh_radioButton.zh", "start": 211983, "end": 215301}, {"filename": "/headers/gui_zh/guizh_root.zh", "start": 215301, "end": 215683}, {"filename": "/headers/gui_zh/guizh_spinner.zh", "start": 215683, "end": 217679}, {"filename": "/headers/gui_zh/guizh_types.zh", "start": 217679, "end": 220317}, {"filename": "/headers/gui_zh/guizh_widget.zh", "start": 220317, "end": 222852}, {"filename": "/headers/gui_zh/guizh_window.zh", "start": 222852, "end": 224177}, {"filename": "/headers/tango.zh", "start": 224177, "end": 231101}, {"filename": "/headers/tango/1.3/tango_access.zh", "start": 231101, "end": 233619}, {"filename": "/headers/tango/1.3/tango_common.zh", "start": 233619, "end": 241634}, {"filename": "/headers/tango/1.3/tango_deprecated.zh", "start": 241634, "end": 241843}, {"filename": "/headers/tango/1.3/tango_drawing.zh", "start": 241843, "end": 254688}, {"filename": "/headers/tango/1.3/tango_font.zh", "start": 254688, "end": 255578}, {"filename": "/headers/tango/1.3/tango_functions.zh", "start": 255578, "end": 277264}, {"filename": "/headers/tango/1.3/tango_loading.zh", "start": 277264, "end": 296875}, {"filename": "/headers/tango/1.3/tango_loggingFull.zh", "start": 296875, "end": 305313}, {"filename": "/headers/tango/1.3/tango_loggingMinimal.zh", "start": 305313, "end": 305928}, {"filename": "/headers/tango/1.3/tango_menu.zh", "start": 305928, "end": 325699}, {"filename": "/headers/tango/1.3/tango_messages.zh", "start": 325699, "end": 327892}, {"filename": "/headers/tango/1.3/tango_metrics.zh", "start": 327892, "end": 330180}, {"filename": "/headers/tango/1.3/tango_processing.zh", "start": 330180, "end": 358546}, {"filename": "/headers/tango/1.3/tango_script.zs", "start": 358546, "end": 358893}, {"filename": "/headers/tango/1.3/tango_stringControlCode.zh", "start": 358893, "end": 363795}, {"filename": "/headers/tango/1.3/tango_stringControlCodeDisabled.zh", "start": 363795, "end": 364114}, {"filename": "/headers/tango/1.3/tango_style.zh", "start": 364114, "end": 370558}, {"filename": "/headers/tango/1.3/tango_user.zh", "start": 370558, "end": 384656}, {"filename": "/headers/tango/1.3/tango_validation.zh", "start": 384656, "end": 393408}, {"filename": "/headers/tango/font/tango_Allegro.zh", "start": 393408, "end": 393670}, {"filename": "/headers/tango/font/tango_GUI.zh", "start": 393670, "end": 395166}, {"filename": "/headers/tango/font/tango_GUIBold.zh", "start": 395166, "end": 396663}, {"filename": "/headers/tango/font/tango_GUINarrow.zh", "start": 396663, "end": 398153}, {"filename": "/headers/tango/font/tango_LA.zh", "start": 398153, "end": 399178}, {"filename": "/headers/tango/font/tango_LttP.zh", "start": 399178, "end": 400646}, {"filename": "/headers/tango/font/tango_LttPSmall.zh", "start": 400646, "end": 402326}, {"filename": "/headers/tango/font/tango_Matrix.zh", "start": 402326, "end": 402782}, {"filename": "/headers/tango/font/tango_NES.zh", "start": 402782, "end": 403067}, {"filename": "/headers/tango/font/tango_Oracle.zh", "start": 403067, "end": 403362}, {"filename": "/headers/tango/font/tango_OracleProportional.zh", "start": 403362, "end": 404876}, {"filename": "/headers/tango/font/tango_Phantom.zh", "start": 404876, "end": 405138}, {"filename": "/headers/tango/font/tango_PhantomProportional.zh", "start": 405138, "end": 406699}, {"filename": "/headers/tango/font/tango_SS3.zh", "start": 406699, "end": 408183}, {"filename": "/headers/tango/font/tango_Small.zh", "start": 408183, "end": 408431}, {"filename": "/headers/tango/font/tango_Small2.zh", "start": 408431, "end": 408684}, {"filename": "/headers/tango/font/tango_SmallProportional.zh", "start": 408684, "end": 410186}, {"filename": "/include/EmilyMisc.zh", "start": 410186, "end": 461002}, {"filename": "/include/bindings.zh", "start": 461002, "end": 463238}, {"filename": "/include/bindings/audio.zh", "start": 463238, "end": 468140}, {"filename": "/include/bindings/bitmap.zh", "start": 468140, "end": 490734}, {"filename": "/include/bindings/bottledata.zh", "start": 490734, "end": 491788}, {"filename": "/include/bindings/bottleshopdata.zh", "start": 491788, "end": 492786}, {"filename": "/include/bindings/combodata.zh", "start": 492786, "end": 507658}, {"filename": "/include/bindings/debug.zh", "start": 507658, "end": 510487}, {"filename": "/include/bindings/directory.zh", "start": 510487, "end": 511728}, {"filename": "/include/bindings/dmapdata.zh", "start": 511728, "end": 518578}, {"filename": "/include/bindings/dropsetdata.zh", "start": 518578, "end": 519224}, {"filename": "/include/bindings/eweapon.zh", "start": 519224, "end": 532709}, {"filename": "/include/bindings/ffc.zh", "start": 532709, "end": 536284}, {"filename": "/include/bindings/file.zh", "start": 536284, "end": 541944}, {"filename": "/include/bindings/filesystem.zh", "start": 541944, "end": 542704}, {"filename": "/include/bindings/game.zh", "start": 542704, "end": 584591}, {"filename": "/include/bindings/genericdata.zh", "start": 584591, "end": 586035}, {"filename": "/include/bindings/global.zh", "start": 586035, "end": 607455}, {"filename": "/include/bindings/graphics.zh", "start": 607455, "end": 611498}, {"filename": "/include/bindings/input.zh", "start": 611498, "end": 613315}, {"filename": "/include/bindings/itemdata.zh", "start": 613315, "end": 626586}, {"filename": "/include/bindings/itemsprite.zh", "start": 626586, "end": 637007}, {"filename": "/include/bindings/lweapon.zh", "start": 637007, "end": 651672}, {"filename": "/include/bindings/mapdata.zh", "start": 651672, "end": 669147}, {"filename": "/include/bindings/messagedata.zh", "start": 669147, "end": 673127}, {"filename": "/include/bindings/npc.zh", "start": 673127, "end": 696763}, {"filename": "/include/bindings/npcdata.zh", "start": 696763, "end": 711735}, {"filename": "/include/bindings/paldata.zh", "start": 711735, "end": 717799}, {"filename": "/include/bindings/player.zh", "start": 717799, "end": 745478}, {"filename": "/include/bindings/portal.zh", "start": 745478, "end": 746382}, {"filename": "/include/bindings/randgen.zh", "start": 746382, "end": 748486}, {"filename": "/include/bindings/region.zh", "start": 748486, "end": 750191}, {"filename": "/include/bindings/savedportal.zh", "start": 750191, "end": 751007}, {"filename": "/include/bindings/screendata.zh", "start": 751007, "end": 786540}, {"filename": "/include/bindings/shopdata.zh", "start": 786540, "end": 787181}, {"filename": "/include/bindings/spritedata.zh", "start": 787181, "end": 788095}, {"filename": "/include/bindings/stack.zh", "start": 788095, "end": 791090}, {"filename": "/include/bindings/subscreendata.zh", "start": 791090, "end": 798625}, {"filename": "/include/bindings/subscreenpage.zh", "start": 798625, "end": 800651}, {"filename": "/include/bindings/subscreenwidget.zh", "start": 800651, "end": 819295}, {"filename": "/include/bindings/text.zh", "start": 819295, "end": 820607}, {"filename": "/include/bindings/websocket.zh", "start": 820607, "end": 823000}, {"filename": "/include/bindings/zinfo.zh", "start": 823000, "end": 823691}, {"filename": "/include/deprecated/sram.zh", "start": 823691, "end": 825616}, {"filename": "/include/deprecated/theRandomHeader.zh", "start": 825616, "end": 856313}, {"filename": "/include/deprecated/time.zh", "start": 856313, "end": 866555}, {"filename": "/include/ffcscript.zh", "start": 866555, "end": 869174}, {"filename": "/include/std.zh", "start": 869174, "end": 869848}, {"filename": "/include/std_zh/ffrules.zh", "start": 869848, "end": 905389}, {"filename": "/include/std_zh/ghostBasedMovement.zh", "start": 905389, "end": 914945}, {"filename": "/include/std_zh/limits.zh", "start": 914945, "end": 917228}, {"filename": "/include/std_zh/script_runners.zh", "start": 917228, "end": 921626}, {"filename": "/include/std_zh/std.cfg", "start": 921626, "end": 923311}, {"filename": "/include/std_zh/std_constants.zh", "start": 923311, "end": 1078029}, {"filename": "/include/std_zh/std_extension.zh", "start": 1078029, "end": 1170337}, {"filename": "/include/std_zh/std_functions.zh", "start": 1170337, "end": 1281976}, {"filename": "/include/std_zh/std_keyboard.zh", "start": 1281976, "end": 1297875}, {"filename": "/include/std_zh/std_sideview.zh", "start": 1297875, "end": 1300737}, {"filename": "/include/std_zh/string/string_constants.zh", "start": 1300737, "end": 1315220}, {"filename": "/include/std_zh/string/string_functions.zh", "start": 1315220, "end": 1339290}, {"filename": "/include/string.zh", "start": 1339290, "end": 1339470}], "remote_package_size": 1339470, "package_uuid": "sha256-46503ee59afc5f615a165b568e95f7d94a3013973035d8af775f7aed12de9571"});

  })();
