class Key {
  constructor() {
    this.key = {
      map: require('@json/keyboard_map.json'), 
      onElement: undefined
    }
  }

  onElement(element) {
    const el = document.querySelectorAll(element)

    this.key.onElement = el.length < 1 || document.querySelector(element) === null ? undefined : [...el]
    return this
  }

  set(opt = {}) {
    const option = {
      to: opt.to && ((/\b(keyup|keydown)\b/).test(opt.to.toLowerCase())) ? opt.to.toLowerCase() : 'keyup',  // maybe add keypress as well (With ASCII-code)
      do: typeof opt.do === 'object' && opt.do.if !== undefined ? opt.do.ret : (typeof opt.do === 'function' ? opt.do : false),
      do_if: typeof opt.do === 'object' && opt.do.if !== undefined ? opt.do.if.toLowerCase() || false : false,
      addKeyCode: typeof opt.do === 'object' && opt.do.addKeyCode ? opt.do.addKeyCode : false
    }

    const do_withoutIf = (element, i) => {
      element.addEventListener(option.to, () => {
        return option.do()
      })
    }

    const do_withIf = async (element, indexOfElement) => {
      const splitIf = option.do_if.split(/(?:or)|[|]/).map(arr => arr.trim().split(/[+&]/))
      let event = []

      element.addEventListener(option.to, (evt) => {
        event.push(parseInt(evt.which || evt.keyCode))
        event.sort((a, b) => b - a)
        
         splitIf.forEach((arr, index) => {
          arr.forEach((item, i) => {
            if(!option.addKeyCode) {
              for (let [key, val] of Object.entries(this.key.map.code)) {
                if(item === key) {
                  splitIf[index][i] = val
                }
              }
            }
          })
          
          arr.sort((a, b) => b - a).toString() === event.toString() ? option.do(evt) : false          
        })

        option.to === 'keydown' ? element.addEventListener('keyup', () => { return event = [] }) : setTimeout(() => { event = [] }, 3)
      })
    }
    
    this.key.onElement === undefined ? (option.do_if ? do_withIf(document) : do_withoutIf(document)) : this.key.onElement.forEach((el) => { option.do_if ? do_withIf(el) : do_withoutIf(el) })
    return this
  }

  preventTyping(options = 'xss') {    
    const arrOfXSS = [
      `<`, `>`, `'`, `"`, `/`, `(`, `&`, `#`, `;`, `=`
    ]; 
    
    const option = {
      what: options === 'xss' ? arrOfXSS : options
    }

    this.key.onElement.forEach(el => {
      el.addEventListener('keydown', e => {
        option.what.includes(e.key) ? e.preventDefault() : null
      })
    })

    return this
  }
}
