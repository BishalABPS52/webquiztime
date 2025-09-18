import pygame
import sys

class StateManager:
    def __init__(self):
        self.states = {}
        self.current_state = None

    def add_state(self, name, state):
        self.states[name] = state

    def set_state(self, name):
        if self.current_state and hasattr(self.current_state, 'on_exit'):
            self.current_state.on_exit()
        self.current_state = self.states.get(name)
        if self.current_state and hasattr(self.current_state, 'on_enter'):
            self.current_state.on_enter()

    def handle_event(self, event):
        if self.current_state and hasattr(self.current_state, 'handle_event'):
            self.current_state.handle_event(event)

    def update(self):
        if self.current_state and hasattr(self.current_state, 'update'):
            self.current_state.update()

    def draw(self, screen):
        if self.current_state and hasattr(self.current_state, 'draw'):
            self.current_state.draw(screen)

class State:
    def handle_event(self, event):
        pass

    def update(self):
        pass

    def draw(self, screen):
        pass

    def on_enter(self):
        pass

    def on_exit(self):
        pass
