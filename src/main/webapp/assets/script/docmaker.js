﻿var __extends = this.__extends || function (d, b) {
	for (var p in b)
		if (b.hasOwnProperty(p))
			d[p] = b[p];
	function __() {
		this.constructor = d;
	}
	__.prototype = b.prototype;
	d.prototype = new __();
};
var doc;
(function (_doc) {
	var tableType = {
		'param': ['参数', '类型', '描述'],
		'ret': ['返回值', '类型', '描述'],
		'method': ['方法', '类型', '描述'],
		'event': ['事件', '类型', '描述'],
		'prop': ['属性', '类型', '描述'],
		'const': ['常量', '类型', '描述']
	};
	function getRealTagetScrollElement(monitoredParent) {
		if (monitoredParent && monitoredParent.document) {
			if (tui.ieVer > 0 || tui.ffVer > 0) {
				return monitoredParent.document.documentElement;
			} else {
				return monitoredParent.document.body;
			}
		} else {
			return monitoredParent;
		}
	}
	var DocMaker = (function (_super) {
		__extends(DocMaker, _super);
		function DocMaker(catalog, contentDiv, edit) {
			if (typeof edit === "undefined") {
				edit = false;
			}
			var _this = this;
			_super.call(this);
			this._fullMenu = [
				{key: "edit", value: "编辑章节", icon: "fa-edit"},
				{value: "-"},
				{key: "addChild", value: "添加子章节"},
				{key: "insertBefore", value: "在本章节之前插入新章节"},
				{key: "insertAfter", value: "在本章节之后插入新章节"},
				{value: "-"},
				{key: "delete", value: "删除本章节以及所有子章节", icon: "fa-trash-o"}
			];
			this._rootMenu = [
				{key: "edit", value: "编辑章节", icon: "fa-edit"},
				{value: "-"},
				{key: "addChild", value: "添加子章节"}
			];
			this._catalogDblClick = (function () {
				var self = _this;
				return function (data) {
					var catalogList = self._catalog;
					var k = catalogList.data().cell(data.index, "key");
					if (k) {
						var elem = document.getElementById(k.substr(1));
						if (elem) {
							var parent = getRealTagetScrollElement(window);
							var pos = tui.relativePosition(elem, parent);
							$(parent).stop().animate({"scrollTop": pos.y - 60}, 200, function () {
								window.location.href = k;
								parent.scrollTop = pos.y - 60;
							});
						}
					}
				};
			})();
			this._dragStart = (function () {
				var self = _this;
				return function (data) {
					var catalogList = self._catalog;
					catalogList.foldRow(data.index);
				};
			})();
			this._dragEnd = (function () {
				var self = _this;
				return function (data) {
					if (data.canceled)
						return;
					var catalogList = self._catalog;
					var dragRow = catalogList.data().at(data.index);
					if (!dragRow.__parent)
						return;
					var dp = dragRow.__parent;
					var tagetRow = catalogList.data().at(data.targetIndex);
					if (data.position === "before") {
						if (!tagetRow.__parent)
							return;
						var tp = tagetRow.__parent;
						var didx = dp.content.indexOf(dragRow);
						dp.content.splice(didx, 1);
						if (dp.content.length <= 0)
							delete dp.content;
						var tidx = tp.content.indexOf(tagetRow);
						tp.content.splice(tidx, 0, dragRow);
					} else if (data.position === "after") {
						if (!tagetRow.__parent)
							return;
						var tp = tagetRow.__parent;
						var didx = dp.content.indexOf(dragRow);
						dp.content.splice(didx, 1);
						if (dp.content.length <= 0)
							delete dp.content;
						var tidx = tp.content.indexOf(tagetRow);
						tp.content.splice(tidx + 1, 0, dragRow);
					} else {
						var didx = dp.content.indexOf(dragRow);
						dp.content.splice(didx, 1);
						if (dp.content.length <= 0)
							delete dp.content;
						if (!tagetRow.content)
							tagetRow.content = [];
						tagetRow.content.push(dragRow);
					}

					//catalogList.data(catalogList.data());
					self.refreshCatalog();
					self.makeItem(self._doc, 0, null, 0, self._div);
					self.fire("change", null);
				};
			})();
			this._edit = edit;
			if (typeof catalog === "string") {
				this._catalog = document.getElementById(catalog)["_ctrl"];
			} else if (typeof catalog === "object" && catalog)
				this._catalog = catalog;
			else
				throw new Error("Invalid parameter need a accordion group or a list control.");
			if (typeof contentDiv === "string")
				this._div = document.getElementById(contentDiv);
			else if (typeof contentDiv === "object" && contentDiv && contentDiv.nodeName)
				this._div = contentDiv;
			else
				throw new Error("Invalid parameter need a HTML element or specify element's id.");
		}
		DocMaker.prototype.content = function () {
			return tui.clone(this._doc, ["__parent", "refresh", "expand", "checked", "num", "level", "key"]);
		};

		DocMaker.prototype.makeTable = function (name, items, container) {
			var tb = document.createElement("table");
			tb.className = "doc-table";
			tb.cellPadding = "0";
			tb.cellSpacing = "0";
			tb.border = "0";
			var head = tb.insertRow(-1);
			var cols = tableType[name];
			for (var i = 0; i < cols.length; i++) {
				var th = document.createElement("th");
				th.innerHTML = cols[i];
				th.className = "doc-col-" + i;
				head.appendChild(th);
			}
			for (var i = 0; i < items.length; i++) {
				var row = tb.insertRow(-1);
				var item = items[i];
				for (var j = 0; j < cols.length; j++) {
					row.insertCell(-1).innerHTML = item[j];
				}
			}
			container.appendChild(tb);
		};

		DocMaker.prototype.makeItem = function (item, idx, parent, level, container) {
			var _this = this;
			item.refresh = function () {
				container.innerHTML = "";
				var parentKey, parentNumber;
				parentKey = parent ? parent.key : null;
				parentNumber = parent ? parent.num : null;
				if (item.id) {
					item.key = parentKey ? parentKey + "." + item.id : "#" + item.id;
					item.num = (parentNumber ? parentNumber + "." : "") + (idx + 1);
				} else {
					item.key = null;
					item.num = null;
				}
				item.level = level;
				var caption = document.createElement("div");
				if (item.num)
					caption.setAttribute("data-number", item.num);
				caption.innerHTML = item.name;
				if (_this._edit) {
					var self = _this;
					var btnMenu = tui.ctrl.button();
					btnMenu.attr("data-menu", "test");
					btnMenu.text("<i class='fa fa-bars'></i> 编辑");
					if (parent === null)
						btnMenu.menu(_this._rootMenu);
					else
						btnMenu.menu(_this._fullMenu);
					btnMenu.menuPos("Rb");
					btnMenu.on("select", function (data) {
						if (data.item.key === "edit") {
							self.showCaptionDialog(parent, item);
						} else if (data.item.key === "insertBefore") {
							self.showCaptionDialog(parent, idx, "before");
						} else if (data.item.key === "insertAfter") {
							self.showCaptionDialog(parent, idx, "after");
						} else if (data.item.key === "addChild") {
							self.showCaptionDialog(item);
						} else if (data.item.key === "delete") {
							tui.askbox("确认删除章节 '" + item.name + "' 吗？", "删除", function (result) {
								if (result === true) {
									parent.content.splice(idx, 1);
									if (parent.content.length <= 0)
										delete parent.content;
									parent.refresh();
									self.refreshCatalog();
									self.fire("change", null);
								}
							});
						}
					});
					caption.appendChild(btnMenu[0]);
				}
				if (item.key)
					caption.id = item.key.substr(1);
				caption.className = "doc-caption doc-level-" + level;
				container.appendChild(caption);
				if (item.desc) {
					var desc = document.createElement("div");
					desc.innerHTML = "<i style='display:none'>a</i>" + item.desc;
					desc.className = "doc-desc";
					container.appendChild(desc);
					var scripts = desc.getElementsByTagName("script");
					if (scripts && scripts.length > 0) {
						for (var i = 0; i < scripts.length; i++) {
							var newScript = document.createElement('script');
							newScript.type = "text/javascript";
							newScript.text = scripts[i].text;
							desc.insertBefore(newScript, scripts[i]);
							tui.removeNode(scripts[i]);
						}
					}
				}
				for (var n in tableType) {
					if (!tableType.hasOwnProperty(n))
						continue;
					if (item[n] && item[n].length > 0) {
						_this.makeTable(n, item[n], container);
					}
				}
				if (item.code) {
					var code = document.createElement("pre");
					code.innerHTML = item.code.replace(/[&<>\t]/g, function (s) {
						if (s === "&")
							return "&amp;";
						else if (s === "<")
							return "&lt;";
						else if (s === ">")
							return "&gt;";
						else if (s === "\t")
							return "  ";
						else
							return s;
					});
					;
					code.className = "tui-panel doc-code";
					container.appendChild(code);
				}
				if (item.pic) {
					var img = document.createElement("img");
					img.src = item.pic;
					img.className = "doc-pic";
					container.appendChild(img);
				}
				if (item.content) {
					for (var i = 0; i < item.content.length; i++) {
						var child = item.content[i];
						var childDiv = document.createElement("div");
						childDiv.className = "doc-container doc-level-" + (level + 1);
						container.appendChild(childDiv);
						_this.makeItem(child, i, item, level + 1, childDiv);
					}
				}
				tui.ctrl.initCtrls(container);
			};
			item.refresh();
		};

		DocMaker.prototype.showCaptionDialog = function (parent, item, pos) {
			var dlg = tui.ctrl.dialog();
			var self = this;
			var itemClone = (typeof item === "object" ? tui.clone(item, "__parent") : {});
			for (var n in tableType) {
				if (!itemClone.hasOwnProperty(n) || itemClone[n] === null)
					itemClone[n] = [];
			}
			dlg.showResource("captionDlg", "段落", [
				{
					name: "确定",
					func: function () {
						var fm = tui.ctrl.input("itemForm");
						if (!fm.validate())
							return;
						var val = fm.value();
						if (item && typeof item === "object") {
							if (typeof val.id !== tui.undef)
								item.id = val.id;
							else
								delete item.id;
							item.name = val.name;
							if (val.desc)
								item.desc = val.desc;
							else
								delete item.desc;
							if (val.pic)
								item.pic = val.pic;
							else
								delete item.pic;
							if (val.code)
								item.code = val.code;
							else
								delete item.code;
							item.index = val.index;
							for (var n in tableType) {
								if (itemClone[n].length > 0)
									item[n] = itemClone[n];
								else
									delete item[n];
							}
							item.refresh();
						} else {
							if (typeof val.id !== tui.undef)
								itemClone.id = val.id;
							itemClone.name = val.name;
							if (val.desc)
								itemClone.desc = val.desc;
							else
								delete itemClone.desc;
							if (val.pic)
								itemClone.pic = val.pic;
							else
								delete itemClone.pic;
							if (val.code)
								itemClone.code = val.code;
							else
								delete itemClone.code;
							itemClone.index = val.index;
							for (var n in tableType) {
								if (itemClone[n].length <= 0)
									delete itemClone[n];
							}
							var items;
							if (parent.content)
								items = parent.content;
							else
								items = parent.content = [];
							if (typeof item === "number" && !isNaN(item)) {
								if (pos === "before") {
									items.splice(item, 0, itemClone);
								} else {
									items.splice(item + 1, 0, itemClone);
								}
							} else
								items.push(itemClone);
							parent.refresh();
						}
						dlg.close();
						self.refreshCatalog();
						self.fire("change", null);
					}
				},
				{
					name: "取消",
					func: function () {
						dlg.close();
					}
				}]);
			var tb = tui.ctrl.grid("detailGrid");
			tui.ctrl.button("detailAdd").on("click", function () {
				var d = tb.data().src();
				d.push(["", "", ""]);
				tb.data(d);
				tb.editRow(d.length - 1);
			});
			function refreshTable() {
				var dtype = tui.ctrl.formAgent("selectedDetail").value();
				tb.data(itemClone[dtype]);
			}
			tui.on("param ret method event prop const", function () {
				refreshTable();
			});
			if (itemClone) {
				if (parent === null) {
					tui.removeNode(document.getElementById("lineItemId"));
				}
				tui.ctrl.input("itemForm").value(itemClone);
				refreshTable();
			}
		};

		DocMaker.prototype.buildCatalog = function (doc, result, edit) {
			if (!doc)
				return;
			for (var i = 0; i < doc.length; i++) {
				var item = {};
				item.key = doc[i].key;
				item.value = doc[i].name;
				doc[i].expand = true;
				if (!edit)
					item.checked = false;
				else
					item.expand = true;
				result.push(item);
				if (doc[i].content && doc[i].content.length > 0 && (doc[i].index || edit)) {
					item.children = [];
					this.buildCatalog(doc[i].content, item.children, edit);
				}
			}
		};

		DocMaker.prototype.refreshCatalog = function () {
			//this.makeItems(doc, null, null, 0, this._div);
			var doc = this._doc;
			var catalog = [];
			var accordions = [];
			doc.expand = true;
			this.buildCatalog(doc.content, catalog, this._edit);

			// Then build catalog
			if (this._catalog instanceof tui.ctrl.List) {
				var catalogList = this._catalog;
				var dp = new tui.ArrayProvider([doc]);
				dp.addKeyMap("value", "name");
				dp.addKeyMap("children", "content");
				catalogList.data(dp);
			} else if (this._catalog instanceof tui.ctrl.AccordionGroup) {
				for (var i = 0; i < catalog.length; i++) {
					var acc = tui.ctrl.accordion();
					acc.caption(catalog[i].value);
					acc.consumeMouseWheelEvent(true);
					if (i === 0)
						acc.expanded(true);
					acc.group(this._catalog.id());
					var dp = new tui.ArrayProvider(catalog[i].children || []);
					acc.data(dp);
					this._catalog.addAccordion(acc);
					accordions.push(acc);
				}
				setTimeout(function () {
					for (var i = 0; i < accordions.length; i++) {
						accordions[i].useAnimation(true);
					}
				}, 0);
				this._catalog.refresh();
			}
		};

		DocMaker.prototype.make = function (doc) {
			if (!doc)
				return;
			this._doc = doc;
			var section = 1;

			// Build content first
			this.makeItem(doc, 0, null, 0, this._div);

			// Refresh catalog
			this.refreshCatalog();
			if (this._edit) {
				var catalogList = this._catalog;
				catalogList.on("rowdragstart", this._dragStart);
				catalogList.on("rowdragend", this._dragEnd);
				catalogList.on("rowdblclick", this._catalogDblClick);
			}
		};
		return DocMaker;
	})(tui.EventObject);
	_doc.DocMaker = DocMaker;
})(doc || (doc = {}));

