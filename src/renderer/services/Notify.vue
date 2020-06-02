<template>
  <div />
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import $ from 'jquery'

@Component({})
export default class Notify extends Vue {
  created () {
    /* notify */
    window.notify = (message: string, level?: string, timeout?: number): void => {
      window.console.log(`[notify][${level}][${new Date().toLocaleString()}] ${message}`)

      timeout = timeout || 1000

      let layerElem = $('.notify-layer')
      if (layerElem.length === 0) {
        layerElem = $('<div class="notify-layer" />').appendTo('body')
      }

      const notifyElem = $(
        `<div class="notify-item anim-fade-in ${(level ? `type-${level}` : '')}"><p class="notify-content"></p></div>`
      )
      notifyElem.find('.notify-content').html(message.replace('\n', '<br/>'))
      notifyElem.prependTo(layerElem)

      const notifyRemove = () => {
        notifyElem.addClass('anim-fade-out')
        setTimeout(() => {
          notifyElem.remove()
        }, 200)
      }

      const timeOutFn = setTimeout(() => {
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
