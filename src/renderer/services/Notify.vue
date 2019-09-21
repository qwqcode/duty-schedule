<template>
  <div />
</template>

<script lang="ts">
import Vue from 'vue'
import { Prop, Watch, Component } from 'vue-property-decorator'
import $ from 'jquery'

@Component({})
export default class Notify extends Vue {
  created() {
    /* notify */
    window.notify = (message: string, level?: string, timeout?: number): void => {
      console.log('[notify][' + level + '][' + new Date().toLocaleString() + '] ' + message)

      timeout = timeout || 1000

      let layerElem = $('.notify-layer')
      if (layerElem.length === 0) {
        layerElem = $('<div class="notify-layer" />').appendTo('body')
      }

      let notifyElem = $(
        '<div class="notify-item anim-fade-in ' + (level ? 'type-' + level : '') + '"><p class="notify-content"></p></div>'
      )
      notifyElem.find('.notify-content').html(message.replace('\n', '<br/>'))
      notifyElem.prependTo(layerElem)

      let notifyRemove = function() {
        notifyElem.addClass('anim-fade-out')
        setTimeout(function() {
          notifyElem.remove()
        }, 200)
      }

      let timeOutFn = setTimeout(() => {
        notifyRemove()
      }, timeout)

      notifyElem.click(() => {
        clearTimeout(timeOutFn)
        notifyRemove()
      })
    }
  }
}
</script>
