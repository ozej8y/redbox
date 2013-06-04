var AnzsrcSelectionReportCriteriaWidgetBuilder = function($, jaffa) {
    var dropDownClass = jaffa.widgets.baseWidget.extend({
        field: null,
        labelField: null,
        oldField: null,
        oldLabelField: null,

        dropDownData: {},
        dropDownDataMapped: null,

        deleteWidget: function() {
            jaffa.form.ignoreField(this.field);
            if (this.labelField != null) {
              jaffa.form.ignoreField(this.labelField);
            }
            this.getContainer().remove();
        },
        // Identity has been altered, adjust the DOM for all fields
        domUpdate: function(from, to, depth) {
            this._super(from, to, depth);
            // Store, we'll need them to notify Jaffa later
            this.oldField = this.field;
            // Replace the portion of the ID that changed
            this.field = this.oldField.domUpdate(from, to, depth);
            // Update DOM but constrain searches to container, since there may
            //  be very temporary duplicate IDs as sort orders swap
            var container = this.getContainer();
            container.find("input[id=\""+this.oldField+"\"]").attr("id", this.field+"");
            container.find("input[id=\""+this.oldField+"code\"]").attr("id", this.field+"code");
            container.find("select[id=\""+this.oldField+".top.dropdown\"]").attr("id", this.field+".top.dropdown");
            container.find("span[id=\""+this.oldField+".top\"]").attr("id", this.field+".top");
            container.find("select[id=\""+this.oldField+".middle.dropdown\"]").attr("id", this.field+".middle.dropdown");
            container.find("span[id=\""+this.oldField+".middle\"]").attr("id", this.field+".middle");
            container.find("select[id=\""+this.oldField+".bottom.dropdown\"]").attr("id", this.field+".bottom.dropdown");
            container.find("span[id=\""+this.oldField+".bottom\"]").attr("id", this.field+".bottom");
            // Tell Jaffa to ignore the field's this widget used to manage
            jaffa.form.ignoreField(this.oldField);

            // TODO: Testing
            // Do it all again for labels if they are stored
            if (this.labelField != null) {
                this.oldLabelField = this.labelField;
                this.labelField = this.oldLabelField.domUpdate(from, to, depth);
                container.find("input[id=\""+this.oldLabelField+"\"]").attr("id", this.labelField);
                jaffa.form.ignoreField(this.oldLabelField);
            }
        },
        // Notify Jaffa that field <=> widget relations need to be updated
        //  This is called separately from above to avoid duplicate IDs that
        //   may occur whilst DOM alterations are occuring
        jaffaUpdate: function() {
            // Only synch if an update has effected this widget
            if (this.oldField != null || this.oldLabelField != null) {
                this._super();
            }
            if (this.oldField != null) {
                jaffa.form.addField(this.field, this.id());
                this.oldField = null;
            }
            if (this.oldLabelField != null) {
                jaffa.form.addField(this.labelField, this.id());
                this.oldLabelField = null;
            }
            // TODO: Validation alterations
        },

        // Whereas init() is the constructor, this method is called after Jaffa
        // knows about us and needs us to build UI elements and modify the form.
        buildUi: function() {
            var ui = this.getContainer();
            ui.html("");
			var label = this.getConfig("label");
            if (label != null) {
                ui.append("<label for=\""+this.field+"\" class=\"widgetLabel\">"+label+"</label>");
            }
			
			this.field = this.getConfig("field");
            if (this.field == null) {
                // TODO: Testing
                jaffa.logError("No field name provided for widget '"+ this.field() +"'. This is mandatory!");
                return;
            }
            ui.append("<input type='hidden'  id='"+this.field+"' />");
            ui.append("<input type='hidden'  id='"+this.field+"code' />");
           	ui.append("<span id='"+this.field+".top'></span><span id='"+this.field+".middle'></span><span id='"+this.field+".bottom'></span>");
			var jsonDataUrl = this.getConfig("json-data-url");
			var topCombo= {};
    		topCombo["field"] = this.field+".top.dropdown";
    		topCombo["json-data-url"] = jsonDataUrl;
       		topCombo["data-top-level-id"] = 'top';
        	topCombo["data-id-key"] = 'rdf:about';       
            topCombo["data-label-key"] = 'skos:prefLabel';
        	topCombo["data-list-key"] = 'results';
        	topCombo["default-value"] = 'skos:narrower';           
    		topCombo["class-list"] = 'widgetListBranding';
    		$("span[id='"+this.field+".top']").jaffaDropDown(topCombo);
    		var field = this.field;
    		$("[id='"+this.id()+"']").on("change","[id='"+this.field+".top.dropdown']",function(){
    												$("[id='"+field+".bottom.dropdown']").hide();
    												var comboValue = $(this).val();
    												if(comboValue != "") {
    													var labelValue = $(this).find("option:selected").text()
    													$("[id='"+field+"']").val(labelValue);
    													$("[id='"+field+"code']").val(comboValue);
    													
												   		var nextCombo= {};
    													nextCombo["field"] = field+".middle.dropdown";
    													nextCombo["json-data-url"] = jsonDataUrl;
       													nextCombo["data-top-level-id"] = comboValue;
        												nextCombo["data-id-key"] = 'rdf:about';       
            											nextCombo["data-label-key"] = 'skos:prefLabel';
        												nextCombo["data-list-key"] = 'results';
        												nextCombo["default-value"] = jaffa.serverData[field+'.middle.dropdown'];;           
    													nextCombo["class-list"] = 'widgetListBranding';
    													$("span[id='"+field+".middle']").jaffaDropDown(nextCombo);
    												}
    												if(comboValue == "") {
    													$("[id='"+field+".middle.dropdown']").hide();
    												}
												});
												
    		$("[id='"+this.id()+"']").on("change","[id='"+this.field+".middle.dropdown']",function(){
    												var comboValue = $(this).val();
    												if(comboValue != "") {
    													var labelValue = $(this).find("option:selected").text();
    													$("[id='"+field+"']").val(labelValue);
    													$("[id='"+field+"code']").val(comboValue);
													
												   		var nextCombo= {};
    													nextCombo["field"] = field+".bottom.dropdown";
    													nextCombo["json-data-url"] = jsonDataUrl;
       													nextCombo["data-top-level-id"] = comboValue;
        												nextCombo["data-id-key"] = 'rdf:about';       
            											nextCombo["data-label-key"] = 'skos:prefLabel';
        												nextCombo["data-list-key"] = 'results';
        												nextCombo["default-value"] = jaffa.serverData[field+'.bottom.dropdown'];;           
    													nextCombo["class-list"] = 'widgetListBranding';
    													$("span[id='"+field+".bottom']").jaffaDropDown(nextCombo);
    												}
    												if(comboValue == "") {
    													//Set the top dropdown box's value and hide the bottom dropdown
    													comboValue = $("[id='"+field+".top.dropdown']").val();
    													var labelValue = $("[id='"+field+".top.dropdown']").find("option:selected").text();
    													$("[id='"+field+"']").val(labelValue);
    													$("[id='"+field+"code']").val(comboValue);
    													$("[id='"+field+".bottom.dropdown']").hide();
    												}
												});
												
			$("[id='"+this.id()+"']").on("change","[id='"+this.field+".bottom.dropdown']",function(){
    												var comboValue = $(this).val();
    												if(comboValue != "") {
    													var labelValue = $(this).find("option:selected").text()
    													$("[id='"+field+"']").val(labelValue);
    													$("[id='"+field+"code']").val(comboValue);
    												}
												});									
												
			jaffa.form.ignoreField(this.field+".top.dropdown",false);
			jaffa.form.ignoreField(this.field+".middle.dropdown",false);
			jaffa.form.ignoreField(this.field+".bottom.dropdown",false);
			jaffa.form.addField(this.field+"",this.id());
			jaffa.form.addField(this.field+"code",this.id());
			
            // Add help content
           	this._super();

            // Activating a change trigger will synch
            //  all fields and the managed data
            

            // Add some validation
            var mandatory = this.getConfig("mandatory");
            var mandatoryOnSave = this.getConfig("mandatory-on-save");
            if (mandatory === true || mandatoryOnSave === true) {
                // Error message creation
                var validationText = this.getConfig("validation-text") || "This field is mandatory";
                var validationMessage = $("<div class=\"jaffaValidationError\">"+validationText+"</div>");
                ui.append(validationMessage);
                // Error message toggling
                validationMessage.hide();
                function invalid(fieldId, testsFailed) {
                    ui.addClass("error");
                    validationMessage.show();
                }
                function valid(fieldId, testsPassed) {
                    ui.removeClass("error");
                    validationMessage.hide();
                }
                // Notify Jaffa about what we want
                if (mandatory === true) {
                    jaffa.valid.setSubmitRules(this.field, ["required"], valid, invalid);
                }
                if (mandatoryOnSave === true) {
                    jaffa.valid.setSaveRules(this.field, ["required"], valid, invalid);
                }
            }

            // Add our custom classes
            this.applyBranding(ui);
        },

        // If any of the fields we told Jaffa we manage
        //   are changed it will call this.
        change: function(fieldName, isValid) {
            // To avoid double handling, just pay attention to the actual value field
            if (fieldName == this.field) {
                // Update our label field if we have one
                if (this.labelField != null) {
                    var label = jaffa.form.field(fieldName).find(":selected").text();
                    jaffa.form.value(this.labelField, label);
                }
                // Complex relations, we want to look like a jQuery automcomplete
                //  to leverage the same methods on the base widget
                var lookupParser = this.getConfig("lookup-parser");
                if (lookupParser != null) {
                    // Because we have a static data source, we only need to map once
                    if (this.dropDownDataMapped == null)  {
                        var thisWidget = this;
                        function mapWrap(item) {
                            return thisWidget.perItemMapping(item);
                        }
                        this.dropDownDataMapped = $.map(this.dropDownData, mapWrap);
                    }
                    // Find our currently selected item and 'select' it
                    var len = this.dropDownDataMapped.length;
                    for (var i = 0; i < len; i++) {
                        var value = this.dropDownDataMapped[i].value;
                        if (value == jaffa.form.value(fieldName)) {
                            // A fake UI element the handler is expecting
                            var ui = {item: this.dropDownDataMapped[i]};
                            this.onSelectItemHandling(null, ui);
                        }
                    }
                }
            }
        },

        // Constructor... any user provided config and the
        //    jQuery container this was called against.
        init: function(config, container) {
            this._super(config, container);
        }
    });

    // *****************************************
    // Let Jaffa know how things hang together. 'jaffaAnzsrcSelection' is how the
    //   developer can create a widget, eg: $("#id").jaffaAnzsrcSelection();
    // And the class links to the above variable that is a valid widget
    //   implementation, extending the Jaffa bas widget.
    jaffa.widgets.registerWidget("jaffaAnzsrcSelectionReportCriteria", dropDownClass);
}
$.requestWidgetLoad(AnzsrcSelectionReportCriteriaWidgetBuilder);

var AnzsrcSelectionReportCriteriaRepeatableWidgetBuilder = function($, jaffa) {
    var dropDownRepeatableClass = jaffa.widgets.listWidget.extend({
        init: function(config, container) {
            this._super(config, container);
            // Make sure 'listWidget' knows how to create each element
            this.childCreator("jaffaAnzsrcSelectionReportCriteria");
        }
    });
    jaffa.widgets.registerWidget("jaffaAnzsrcSelectionReportCriteriaRepeatable", dropDownRepeatableClass);
}
$.requestWidgetLoad(AnzsrcSelectionReportCriteriaRepeatableWidgetBuilder);