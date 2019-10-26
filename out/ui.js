let ui = {
    canvas: document.getElementById('canvas'),
    canvasWrapper: document.getElementById('canvas-wrapper'),
    leftSide: document.getElementById('left'),
    canvasOffsetX: function () {
        return parseInt(getComputedStyle(this.leftSide).getPropertyValue('width'));
    },
    buttons: document.getElementsByClassName('mode'),
    checkboxes: document.getElementsByClassName('toggle'),
    objectList: document.getElementById('object-list'),
    objectChildren: document.getElementById('object-children'),
    props: document.getElementsByClassName('properties'),
    clearProps: function () {
        for (let i = 0; i < this.props.length; i++) {
            this.props[i].classList.add('no-display');
        }
        while (this.objectChildren.firstChild) {
            this.objectChildren.removeChild(this.objectChildren.firstChild);
        }
    },
    updateVectorProps: function (vector) {
        let vectorProps = document.getElementsByClassName(vector.id)[0] || document.getElementsByName('vector')[0];
        vectorProps.classList.remove('no-display');
        let inputX = vectorProps.children.namedItem('vector-x').children[0];
        let inputY = vectorProps.children.namedItem('vector-y').children[0];
        [inputX, inputY].forEach(i => i.addEventListener('input', e => {
            vector.setPosition(new Vector(parseFloat(inputX.value), parseFloat(inputY.value)));
            cam.update();
        }));
        inputX.value = vector.x;
        inputY.value = vector.y;
    },
    updateLineProps: function (line) {
        document.getElementById('line').classList.remove('no-display');
        document.getElementById('line-heading').innerHTML = line.length() === Infinity ? 'Line' : 'Line Segment';
        /*line.children.forEach(c => {
          if (!document.getElementsByClassName(c.id).length) {
            let li = document.createElement('li');
            li.appendChild(this.getVectorTemplate(c));
            this.objectChildren.appendChild(li);
          }
          this.updateVectorProps(c);
        });*/
    },
    getVectorTemplate: function (vector) {
        let textH2 = document.createTextNode('Vector');
        let h2 = document.createElement('h2');
        h2.classList.add('side-heading');
        h2.classList.add('properties-heading');
        h2.appendChild(textH2);
        let textX = document.createTextNode('x: ');
        let textY = document.createTextNode('y: ');
        let inputX = document.createElement('input');
        inputX.type = 'text';
        inputX.value = vector.x;
        let inputY = document.createElement('input');
        inputY.type = 'text';
        inputY.value = vector.y;
        [inputX, inputY].forEach(e => addEventListener('input', function (e) {
            vector.setPosition(new Vector(parseFloat(inputX.value), parseFloat(inputY.value)));
            cam.update();
        }));
        let labelX = document.createElement('label');
        labelX.setAttribute('name', 'vector-x');
        labelX.appendChild(textX);
        labelX.appendChild(inputX);
        let labelY = document.createElement('label');
        labelY.setAttribute('name', 'vector-y');
        labelY.appendChild(textY);
        labelY.appendChild(inputY);
        let div = document.createElement('div');
        div.setAttribute('name', 'vector');
        div.classList.add('properties');
        div.classList.add(vector.id);
        div.appendChild(h2);
        div.appendChild(labelX);
        div.appendChild(labelY);
        return div;
    },
    canvasCSSWidth: function () {
        return parseInt(getComputedStyle(this.canvas).getPropertyValue('width'));
    },
    canvasCSSHeight: function () {
        return parseInt(getComputedStyle(this.canvas).getPropertyValue('height'));
    },
    addObject: function (prefix, object) {
        let item = this.objectList.children.namedItem(object.id);
        let itemList;
        if (item) {
            itemList = item.children[1];
        }
        else {
            item = document.createElement("li");
            let div = document.createElement("div");
            let text = document.createTextNode(prefix + object.toString());
            item.id = object.id;
            div.appendChild(text);
            item.appendChild(div);
            itemList = document.createElement("ul");
            item.addEventListener("mousedown", function () {
                if (div.id) {
                    div.id = '';
                    itemList.id = '';
                }
                else {
                    div.id = 'darken';
                    itemList.id = 'show';
                }
            });
            this.objectList.appendChild(item);
        }
        if (object.children) {
            object.children.forEach(c => {
                if (!itemList.children.namedItem(c.id)) {
                    let subItem = document.createElement("li");
                    subItem.id = c.id;
                    subItem.appendChild(document.createTextNode("Vector " + c.toString()));
                    itemList.appendChild(subItem);
                }
            });
            item.appendChild(itemList);
        }
    },
    wireUpButtons: function () {
        for (let i = 0; i < ui.buttons.length; i++) {
            let button = ui.buttons[i];
            button.addEventListener('mousedown', e => {
                settings.mode = e.target.getAttribute('value').toLowerCase();
            });
        }
    },
    wireUpCheckboxes: function () {
        for (let i = 0; i < this.checkboxes.length; i++) {
            let checkbox = this.checkboxes[i];
            // set the checkbox to reflect default setting values
            checkbox.checked = settings[checkbox.getAttribute('value')];
            checkbox.addEventListener('change', e => {
                if (e.target.checked) {
                    settings[e.target.getAttribute('value')] = true;
                }
                else {
                    settings[e.target.getAttribute('value')] = false;
                }
            });
        }
    },
    init: function () {
        this.canvas.width = this.canvasCSSWidth();
        this.canvas.height = this.canvasCSSHeight();
        this.wireUpButtons();
        this.wireUpCheckboxes();
    }
};
