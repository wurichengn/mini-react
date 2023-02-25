
import { memo } from './core/decorator';
import { Fiber } from './core/fiber';
import { render, useEffect, useRef, useState } from './core/render';
import { Component, PureComponent } from './utils/component';
import { createContext } from './utils/createContext';
import { createElement } from './utils/createElement';
import { useDebugValue } from './utils/hooks';

const React = {
  createElement,
  render,
  Fiber,
  useState,
  createContext,
  Component,
  PureComponent,
  memo,
  useRef,
  useDebugValue,
  useEffect
};

export {
  createElement,
  render,
  Fiber,
  useState,
  createContext,
  Component,
  PureComponent,
  memo,
  useRef,
  useDebugValue,
  useEffect
};

export default React;
