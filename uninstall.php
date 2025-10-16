<?php
   defined( 'ABSPATH' ) || die( 'No direct script access allowed!' );
   
   global $wpdb;
   $table = $wpdb->prefix."wpmelon_wadvbedit_temp";

   $wpdb->query("DROP TABLE IF EXISTS $table");