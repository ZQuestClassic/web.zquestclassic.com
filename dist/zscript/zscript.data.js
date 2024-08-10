
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
      var PACKAGE_NAME = '/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zscript.data';
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
          }          Module['removeRunDependency']('datafile_/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zscript.data');

      };
      Module['addRunDependency']('datafile_/Users/connorclark/code/ZeldaClassic-secondary/build_emscripten/Release/zscript.data');

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
    loadPackage({"files": [{"filename": "/base_config/zscript.cfg", "start": 0, "end": 235}, {"filename": "/headers/examples/gui_example.zs", "start": 235, "end": 3961}, {"filename": "/headers/examples/tango_example.zh", "start": 3961, "end": 8944}, {"filename": "/headers/ghost.zh", "start": 8944, "end": 16047}, {"filename": "/headers/ghost_zh/2.8/changelog.txt", "start": 16047, "end": 27015}, {"filename": "/headers/ghost_zh/2.8/ghost2_common.zh", "start": 27015, "end": 30435}, {"filename": "/headers/ghost_zh/2.8/ghost2_deprecated.zh", "start": 30435, "end": 36453}, {"filename": "/headers/ghost_zh/2.8/ghost2_drawing.zh", "start": 36453, "end": 42853}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweapon.zh", "start": 42853, "end": 71544}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweaponDeath.zh", "start": 71544, "end": 79217}, {"filename": "/headers/ghost_zh/2.8/ghost2_eweaponMovement.zh", "start": 79217, "end": 93091}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental.zh", "start": 93091, "end": 94149}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental2.zh", "start": 94149, "end": 95212}, {"filename": "/headers/ghost_zh/2.8/ghost2_experimental_movement.zh", "start": 95212, "end": 97265}, {"filename": "/headers/ghost_zh/2.8/ghost2_flags.zh", "start": 97265, "end": 99892}, {"filename": "/headers/ghost_zh/2.8/ghost2_global.zh", "start": 99892, "end": 109271}, {"filename": "/headers/ghost_zh/2.8/ghost2_init.zh", "start": 109271, "end": 116743}, {"filename": "/headers/ghost_zh/2.8/ghost2_init_bugged.zh", "start": 116743, "end": 121599}, {"filename": "/headers/ghost_zh/2.8/ghost2_modification.zh", "start": 121599, "end": 125747}, {"filename": "/headers/ghost_zh/2.8/ghost2_movement.zh", "start": 125747, "end": 157780}, {"filename": "/headers/ghost_zh/2.8/ghost2_other.zh", "start": 157780, "end": 176112}, {"filename": "/headers/ghost_zh/2.8/ghost2_scripts.zs", "start": 176112, "end": 176601}, {"filename": "/headers/ghost_zh/2.8/ghost2_update.zh", "start": 176601, "end": 199427}, {"filename": "/headers/ghost_zh/2.8/ghost_experimental.zh", "start": 199427, "end": 199652}, {"filename": "/headers/gui.zh", "start": 199652, "end": 201155}, {"filename": "/headers/gui_zh/guizh_button.zh", "start": 201155, "end": 202892}, {"filename": "/headers/gui_zh/guizh_checkbox.zh", "start": 202892, "end": 204851}, {"filename": "/headers/gui_zh/guizh_common.zh", "start": 204851, "end": 205066}, {"filename": "/headers/gui_zh/guizh_event.zh", "start": 205066, "end": 205879}, {"filename": "/headers/gui_zh/guizh_label.zh", "start": 205879, "end": 206686}, {"filename": "/headers/gui_zh/guizh_main.zh", "start": 206686, "end": 211966}, {"filename": "/headers/gui_zh/guizh_radioButton.zh", "start": 211966, "end": 215284}, {"filename": "/headers/gui_zh/guizh_root.zh", "start": 215284, "end": 215666}, {"filename": "/headers/gui_zh/guizh_spinner.zh", "start": 215666, "end": 217662}, {"filename": "/headers/gui_zh/guizh_types.zh", "start": 217662, "end": 220300}, {"filename": "/headers/gui_zh/guizh_widget.zh", "start": 220300, "end": 222835}, {"filename": "/headers/gui_zh/guizh_window.zh", "start": 222835, "end": 224160}, {"filename": "/headers/tango.zh", "start": 224160, "end": 231084}, {"filename": "/headers/tango/1.3/tango_access.zh", "start": 231084, "end": 233602}, {"filename": "/headers/tango/1.3/tango_common.zh", "start": 233602, "end": 241617}, {"filename": "/headers/tango/1.3/tango_deprecated.zh", "start": 241617, "end": 241826}, {"filename": "/headers/tango/1.3/tango_drawing.zh", "start": 241826, "end": 254671}, {"filename": "/headers/tango/1.3/tango_font.zh", "start": 254671, "end": 255561}, {"filename": "/headers/tango/1.3/tango_functions.zh", "start": 255561, "end": 277247}, {"filename": "/headers/tango/1.3/tango_loading.zh", "start": 277247, "end": 296858}, {"filename": "/headers/tango/1.3/tango_loggingFull.zh", "start": 296858, "end": 305296}, {"filename": "/headers/tango/1.3/tango_loggingMinimal.zh", "start": 305296, "end": 305911}, {"filename": "/headers/tango/1.3/tango_menu.zh", "start": 305911, "end": 325682}, {"filename": "/headers/tango/1.3/tango_messages.zh", "start": 325682, "end": 327875}, {"filename": "/headers/tango/1.3/tango_metrics.zh", "start": 327875, "end": 330163}, {"filename": "/headers/tango/1.3/tango_processing.zh", "start": 330163, "end": 358529}, {"filename": "/headers/tango/1.3/tango_script.zs", "start": 358529, "end": 358876}, {"filename": "/headers/tango/1.3/tango_stringControlCode.zh", "start": 358876, "end": 363778}, {"filename": "/headers/tango/1.3/tango_stringControlCodeDisabled.zh", "start": 363778, "end": 364097}, {"filename": "/headers/tango/1.3/tango_style.zh", "start": 364097, "end": 370541}, {"filename": "/headers/tango/1.3/tango_user.zh", "start": 370541, "end": 384639}, {"filename": "/headers/tango/1.3/tango_validation.zh", "start": 384639, "end": 393391}, {"filename": "/headers/tango/font/tango_Allegro.zh", "start": 393391, "end": 393653}, {"filename": "/headers/tango/font/tango_GUI.zh", "start": 393653, "end": 395149}, {"filename": "/headers/tango/font/tango_GUIBold.zh", "start": 395149, "end": 396646}, {"filename": "/headers/tango/font/tango_GUINarrow.zh", "start": 396646, "end": 398136}, {"filename": "/headers/tango/font/tango_LA.zh", "start": 398136, "end": 399161}, {"filename": "/headers/tango/font/tango_LttP.zh", "start": 399161, "end": 400629}, {"filename": "/headers/tango/font/tango_LttPSmall.zh", "start": 400629, "end": 402309}, {"filename": "/headers/tango/font/tango_Matrix.zh", "start": 402309, "end": 402765}, {"filename": "/headers/tango/font/tango_NES.zh", "start": 402765, "end": 403050}, {"filename": "/headers/tango/font/tango_Oracle.zh", "start": 403050, "end": 403345}, {"filename": "/headers/tango/font/tango_OracleProportional.zh", "start": 403345, "end": 404859}, {"filename": "/headers/tango/font/tango_Phantom.zh", "start": 404859, "end": 405121}, {"filename": "/headers/tango/font/tango_PhantomProportional.zh", "start": 405121, "end": 406682}, {"filename": "/headers/tango/font/tango_SS3.zh", "start": 406682, "end": 408166}, {"filename": "/headers/tango/font/tango_Small.zh", "start": 408166, "end": 408414}, {"filename": "/headers/tango/font/tango_Small2.zh", "start": 408414, "end": 408667}, {"filename": "/headers/tango/font/tango_SmallProportional.zh", "start": 408667, "end": 410169}, {"filename": "/include/EmilyMisc.zh", "start": 410169, "end": 460985}, {"filename": "/include/bindings.zh", "start": 460985, "end": 463221}, {"filename": "/include/bindings/audio.zh", "start": 463221, "end": 468123}, {"filename": "/include/bindings/bitmap.zh", "start": 468123, "end": 490717}, {"filename": "/include/bindings/bottledata.zh", "start": 490717, "end": 491771}, {"filename": "/include/bindings/bottleshopdata.zh", "start": 491771, "end": 492769}, {"filename": "/include/bindings/combodata.zh", "start": 492769, "end": 507641}, {"filename": "/include/bindings/debug.zh", "start": 507641, "end": 510470}, {"filename": "/include/bindings/directory.zh", "start": 510470, "end": 511711}, {"filename": "/include/bindings/dmapdata.zh", "start": 511711, "end": 518561}, {"filename": "/include/bindings/dropsetdata.zh", "start": 518561, "end": 519207}, {"filename": "/include/bindings/eweapon.zh", "start": 519207, "end": 532692}, {"filename": "/include/bindings/ffc.zh", "start": 532692, "end": 536267}, {"filename": "/include/bindings/file.zh", "start": 536267, "end": 541927}, {"filename": "/include/bindings/filesystem.zh", "start": 541927, "end": 542687}, {"filename": "/include/bindings/game.zh", "start": 542687, "end": 584574}, {"filename": "/include/bindings/genericdata.zh", "start": 584574, "end": 586018}, {"filename": "/include/bindings/global.zh", "start": 586018, "end": 607438}, {"filename": "/include/bindings/graphics.zh", "start": 607438, "end": 611481}, {"filename": "/include/bindings/input.zh", "start": 611481, "end": 613298}, {"filename": "/include/bindings/itemdata.zh", "start": 613298, "end": 626569}, {"filename": "/include/bindings/itemsprite.zh", "start": 626569, "end": 636990}, {"filename": "/include/bindings/lweapon.zh", "start": 636990, "end": 651655}, {"filename": "/include/bindings/mapdata.zh", "start": 651655, "end": 669130}, {"filename": "/include/bindings/messagedata.zh", "start": 669130, "end": 673110}, {"filename": "/include/bindings/npc.zh", "start": 673110, "end": 696746}, {"filename": "/include/bindings/npcdata.zh", "start": 696746, "end": 711718}, {"filename": "/include/bindings/paldata.zh", "start": 711718, "end": 717782}, {"filename": "/include/bindings/player.zh", "start": 717782, "end": 745461}, {"filename": "/include/bindings/portal.zh", "start": 745461, "end": 746365}, {"filename": "/include/bindings/randgen.zh", "start": 746365, "end": 748469}, {"filename": "/include/bindings/region.zh", "start": 748469, "end": 750174}, {"filename": "/include/bindings/savedportal.zh", "start": 750174, "end": 750990}, {"filename": "/include/bindings/screendata.zh", "start": 750990, "end": 786523}, {"filename": "/include/bindings/shopdata.zh", "start": 786523, "end": 787164}, {"filename": "/include/bindings/spritedata.zh", "start": 787164, "end": 788078}, {"filename": "/include/bindings/stack.zh", "start": 788078, "end": 791073}, {"filename": "/include/bindings/subscreendata.zh", "start": 791073, "end": 798608}, {"filename": "/include/bindings/subscreenpage.zh", "start": 798608, "end": 800634}, {"filename": "/include/bindings/subscreenwidget.zh", "start": 800634, "end": 819278}, {"filename": "/include/bindings/text.zh", "start": 819278, "end": 820590}, {"filename": "/include/bindings/websocket.zh", "start": 820590, "end": 822983}, {"filename": "/include/bindings/zinfo.zh", "start": 822983, "end": 823674}, {"filename": "/include/deprecated/sram.zh", "start": 823674, "end": 825599}, {"filename": "/include/deprecated/theRandomHeader.zh", "start": 825599, "end": 856296}, {"filename": "/include/deprecated/time.zh", "start": 856296, "end": 866538}, {"filename": "/include/ffcscript.zh", "start": 866538, "end": 869157}, {"filename": "/include/std.zh", "start": 869157, "end": 869831}, {"filename": "/include/std_zh/ffrules.zh", "start": 869831, "end": 905372}, {"filename": "/include/std_zh/ghostBasedMovement.zh", "start": 905372, "end": 914928}, {"filename": "/include/std_zh/limits.zh", "start": 914928, "end": 917211}, {"filename": "/include/std_zh/script_runners.zh", "start": 917211, "end": 921609}, {"filename": "/include/std_zh/std.cfg", "start": 921609, "end": 923294}, {"filename": "/include/std_zh/std_constants.zh", "start": 923294, "end": 1078012}, {"filename": "/include/std_zh/std_extension.zh", "start": 1078012, "end": 1170320}, {"filename": "/include/std_zh/std_functions.zh", "start": 1170320, "end": 1281959}, {"filename": "/include/std_zh/std_keyboard.zh", "start": 1281959, "end": 1297858}, {"filename": "/include/std_zh/std_sideview.zh", "start": 1297858, "end": 1300720}, {"filename": "/include/std_zh/string/string_constants.zh", "start": 1300720, "end": 1315203}, {"filename": "/include/std_zh/string/string_functions.zh", "start": 1315203, "end": 1339273}, {"filename": "/include/string.zh", "start": 1339273, "end": 1339453}], "remote_package_size": 1339453, "package_uuid": "sha256-03fdfa1cef7a9e4e792e34d163564870228331c6c430b25131f66c1aabcfe638"});

  })();

export default Module;