jQuery( document ).ready( function($) {

	var loading_icon 	= '<span class="saving-icon"><img src="images/wpspin_light.gif"/> saving...</span>';
	var saved_icon 		= '<span class="saved-icon"><div class="dashicons dashicons-yes"></div> saved!</span>';


	// Add todo item
	$( 'body, .list-item-content' ).on( 'keydown', '.add-list-item', function( e ) {

		if( e.keyCode == 13 && $( this ).val() != '' ) {

			var post_id 	= $( this ).closest( ".postbox" ).attr( 'id' );
			var list_item 	= '<div class="list-item"><div class="dashicons dashicons-menu wpdn-note-sortable"></div><input type="checkbox"><span class="list-item-content" contenteditable="true">' + $( this ).val() + '</span><div class="delete-item dashicons dashicons-no-alt"></div></div>';

			$( '#' + post_id + ' div.wp-dashboard-note' ).append( list_item );
			$( this ).val( '' ); // Clear 'add item' field
			$( this ).trigger( 'note-sortable' );

			$( this ).trigger( 'wpdn-update', this );

		}

	});


	// Delete todo item
	$( 'body' ).on( 'click', '.delete-item', function() {

		var post_id = $( this ).closest( ".postbox" ).attr( 'id' );

		$( this ).parent( '.list-item' ).remove();
		$( 'body' ).trigger( 'wpdn-update', ['', post_id]  );

	});


	// Toggle visibility
	$( 'body' ).on( 'click', '.wpdn-visibility', function() {

		$( this ).toggleClass( 'dashicons-lock dashicons-groups' );

		var visibility = $( this ).parent().attr( 'data-visibility' );
		if ( 'public' == visibility ) {
			$( this ).parent( '.wpdn-toggle-visibility' ).attr( 'data-visibility', 'private' );
			$( this ).parent( '.wpdn-toggle-visibility' ).attr( 'title', 'Visibility: Just me' );
		} else {
			$( this ).parent( '.wpdn-toggle-visibility' ).attr( 'data-visibility', 'public' );
			$( this ).parent( '.wpdn-toggle-visibility' ).attr( 'title', 'Visibility: Everyone' );
		}

		$( this ).trigger( 'wpdn-update', this );

	});


	// Toggle note type
	$( 'body' ).on( 'click', '.wpdn-note-type', function() {

		$( this ).toggleClass( 'dashicons-list-view dashicons-welcome-write-blog' );

		var note_type = $( this ).closest( '[data-note-type]' ).attr( 'data-note-type' );
		if ( note_type == 'regular' ) {
			$( this ).closest( '[data-note-type]' ).attr( 'data-note-type', 'list' );
		} else {
			$( this ).closest( '[data-note-type]' ).attr( 'data-note-type', 'regular' );
		}

		var data = {
			action: 	'wpdn_toggle_note',
			post_id: 	$( this ).closest( ".postbox" ).attr( 'id' ).replace( 'note_', '' ),
			note_type:	( note_type == 'regular' ? 'list' : 'regular' )
		};

		$.post( ajaxurl, data, function( response ) {
			$( '#note_' + data.post_id + ' .inside' ).html( response ).trigger( 'note-sortable' );;
		});

		$( this ).trigger( 'wpdn-update', this );

	});


	// Update note trigger
	$( 'body' ).on( 'wpdn-update', function( event, t, post_id ) {

		if ( t != '' ) {
			post_id = $( t ).closest( ".postbox" ).attr( 'id' );
		}

		if ( ! post_id ) {
			return;
		}

		$( '#' + post_id + ' .wp-dashboard-note-options .status' ).html( loading_icon );
		var data = {
			action: 			'wpdn_update_note',
			post_id: 			post_id.replace( 'note_', '' ),
			post_content: 		$( '#' + post_id + ' div.wp-dashboard-note' ).html(),
			post_title: 		$( '#' + post_id + ' > h3 .wpdn-title' ).html(),
			note_visibility:	$( '#' + post_id + ' [data-visibility]' ).attr( 'data-visibility' ),
			note_color_text:	$( '#' + post_id + ' [data-color-text]' ).attr( 'data-color-text' ),
			note_color:			$( '#' + post_id + ' [data-note-color]' ).attr( 'data-note-color' ),
			note_type:			$( '#' + post_id + ' [data-note-type]' ).attr( 'data-note-type' )
		};

		$.post( ajaxurl, data, function( response ) {
			$( '#' + post_id + ' .wp-dashboard-note-options .status' ).html( saved_icon );
			$( '#' + post_id + ' .wp-dashboard-note-options .status *' ).fadeOut( 1000, function() { $( this ).html( '' ) });
		});

	});


	// Delete note
	$( 'body' ).on( 'click', '.wpdn-delete-note', function() {

		var post_id = $( this ).closest( ".postbox" ).attr( 'id' );

		$( '#' + post_id ).fadeOut( 500, function() { $( this ).remove() } );

		var data = {
			action: 'wpdn_delete_note',
			post_id: post_id.replace( 'note_', '' ),
		};

		$.post( ajaxurl, data, function( response ) {

		});

	});


	// Add note
	$( 'body' ).on( 'click', '.wpdn-add-note, #add_note-hide', function() {

		var data = { action: 'wpdn_add_note' };

		$.post( ajaxurl, data, function( response ) {
			response = jQuery.parseJSON( response );
			jQuery( '#postbox-container-1 #normal-sortables' ).append( response.note );
			jQuery('body, html').animate({ scrollTop: $( "#note_" + response.post_id ).offset().top - 50 }, 750); // scroll down
			jQuery( '#note_' + response.post_id + ' .add-list-item' ).focus();
		});


		// Stop scrollTop animation on user scroll
		$( 'html, body' ).bind("scroll mousedown DOMMouseScroll mousewheel keyup", function( e ){
			if ( e.which > 0 || e.type === "mousedown" || e.type === "mousewheel") {
				$( 'html, body' ).stop().unbind('scroll mousedown DOMMouseScroll mousewheel keyup');
			}
		});

	});

	// Change color
	$( 'body' ).on( 'click', '.color', function() {

		// Set variables
		var color = $( this ).attr( 'data-select-color' );
		var color_text = $( this ).attr( 'data-select-color-text' );

		// Preview
		$( this ).closest( '.postbox' ).css( 'background-color', color );
		$( this ).closest( '.wp-dashboard-note-wrap' ).attr( 'data-color-text', color_text );

		// Set saving attributes
		$( '[data-note-color]' ).attr( 'data-note-color', color );
		$( this ).closest( '[data-color-text]' ).attr( 'data-color-text', color_text );

		// Update note
		$( this ).trigger( 'wpdn-update', this );
	});


	// Edit/update note
	$( 'body' ).on( 'blur', '.list-item-content, [contenteditable=true]', function() {
  		$( this ).trigger( 'wpdn-update', this );
	});

	// Save on enter (list note)
	$( 'body' ).on( 'keydown', '[data-note-type=list], .wpdn-title, .list-item-content', function( e ) {
	    if ( e.keyCode == 13 ) {
      		$( this ).trigger( 'wpdn-update', this );
      		$( this ).blur();
			return false;
		}
	});
	// Save on CMD|CTRL + enter (regular note)
	$( 'body' ).on( 'keydown', '[data-note-type=regular] .wp-dashboard-note', function( e ) {
		if ( e.keyCode == 13 && ( e.ctrlKey || e.metaKey ) ) {
			$( this ).trigger( 'wpdn-update', this );
      		$( this ).blur();
			return false;
		}
	});


	// Edit title
	$( 'body, .postbox h3' ).on( 'click', '.wpdn-edit-title', function( e ) {
		$( this ).prev().focus();
		document.execCommand( 'selectAll', false, null );
		e.stopPropagation();
	});


	// Note checkbox toggle
	$( 'input[type=checkbox]' ).change( function() {
	    if( this.checked ) {
	        $( this ).attr( 'checked', 'checked' );
	    } else {
		    $( this ).removeAttr( 'checked' );
	    }
  		$( this ).trigger( 'wpdn-update', this );
    });


    // Make list sortable
    $( 'body' ).on( 'note-sortable', function() {
		$( '.wp-dashboard-note' ).sortable({
			handle: '.wpdn-note-sortable',
			update: function( event, ui ) {
				$( this ).trigger( 'wpdn-update', this );
			},
			axis: 'y'
		});
	})
	.trigger( 'note-sortable' );


	// Open link box when hovering a link
	$( '.wp-dashboard-note-wrap a' ).hover( function() {

		var url = $( this ).attr( 'href' );
		$( this ).append( '<span class="link-hover" contenteditable="false"><a href="' + url + '" target="_blank" contenteditable="false">Open link</a></span>' );

	}, function() {

		$( '.link-hover' ).remove();

	});

});
