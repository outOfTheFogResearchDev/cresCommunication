{
  "targets": [
    { 
      "target_name": "getPower",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/getPower.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    },
    { 
      "target_name": "setAnalyzer",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/setAnalyzer.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    },
    { 
      "target_name": "resetAnalyzer",
      "include_dirs": [ "<(module_root_dir)/server/app/utils/cpp" ],
      "sources": [ "<(module_root_dir)/server/app/utils/cpp/resetAnalyzer.cpp" ],
      "link_settings": { "libraries": [ "-lvisa64" ], "library_dirs" : [ "<(module_root_dir)/server/app/utils/cpp" ] }
    }
  ]
}