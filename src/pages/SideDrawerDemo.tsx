import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SideDrawer } from '@/components/SideDrawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SideDrawerDemo = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [transitionDuration, setTransitionDuration] = useState(300);
  const [drawerWidth, setDrawerWidth] = useState('400px');
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'top' | 'bottom'>('left');
  const [smoothness, setSmoothness] = useState<'ease-in-out' | 'ease-in' | 'ease-out' | 'linear' | 'bounce' | 'spring' | 'smooth'>('ease-in-out');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
    setCurrentStep(1);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setCurrentStep(1);
  };

  const handleNextStep = () => {
    setCurrentStep(2);
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      handleCloseDrawer();
    }
  };

  const handleSave = () => {
    console.log('Saving form data:', formData);
    alert('Form data saved!');
    handleCloseDrawer();
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '', message: '' });
    handleCloseDrawer();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 1: Basic Information</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter your email"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Step 2: Additional Details</h3>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Enter your message"
                rows={5}
              />
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-medium text-sm">Summary:</h4>
              <p className="text-sm text-gray-600">Name: {formData.name || 'Not provided'}</p>
              <p className="text-sm text-gray-600">Email: {formData.email || 'Not provided'}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getFooterButtons = () => {
    if (currentStep === 1) {
      return [
        {
          label: 'Cancel',
          variant: 'ghost' as const,
          action: handleCancel
        },
        {
          label: 'Next',
          variant: 'default' as const,
          action: handleNextStep,
          disabled: !formData.name || !formData.email
        }
      ];
    } else {
      return [
        {
          label: 'Cancel',
          variant: 'ghost' as const,
          action: handleCancel
        },
        {
          label: 'Save',
          variant: 'default' as const,
          action: handleSave
        }
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Side Drawer Demo</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Examples</h2>
          <p className="text-gray-600 mb-6">
            Configure the transition duration, width, sliding direction, and smoothness of the side drawer.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Label htmlFor="transition-duration">Duration:</Label>
              <Select value={transitionDuration.toString()} onValueChange={(value) => setTransitionDuration(Number(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="150">150ms</SelectItem>
                  <SelectItem value="300">300ms</SelectItem>
                  <SelectItem value="500">500ms</SelectItem>
                  <SelectItem value="700">700ms</SelectItem>
                  <SelectItem value="1000">1000ms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="drawer-width">Width:</Label>
              <Select value={drawerWidth} onValueChange={setDrawerWidth}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10%">10%</SelectItem>
                  <SelectItem value="20%">20%</SelectItem>
                  <SelectItem value="25%">25%</SelectItem>
                  <SelectItem value="30%">30%</SelectItem>
                  <SelectItem value="40%">40%</SelectItem>
                  <SelectItem value="50%">50%</SelectItem>
                  <SelectItem value="60%">60%</SelectItem>
                  <SelectItem value="70%">70%</SelectItem>
                  <SelectItem value="80%">80%</SelectItem>
                  <SelectItem value="90%">90%</SelectItem>
                  <SelectItem value="100%">100%</SelectItem>
                  <SelectItem value="400px">400px</SelectItem>
                  <SelectItem value="500px">500px</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="slide-direction">Direction:</Label>
              <Select value={slideDirection} onValueChange={(value: 'left' | 'right' | 'top' | 'bottom') => setSlideDirection(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="smoothness">Smoothness:</Label>
              <Select value={smoothness} onValueChange={(value: 'ease-in-out' | 'ease-in' | 'ease-out' | 'linear' | 'bounce' | 'spring' | 'smooth') => setSmoothness(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ease-in-out">Ease In-Out</SelectItem>
                  <SelectItem value="ease-in">Ease In</SelectItem>
                  <SelectItem value="ease-out">Ease Out</SelectItem>
                  <SelectItem value="linear">Linear</SelectItem>
                  <SelectItem value="bounce">Bounce</SelectItem>
                  <SelectItem value="spring">Spring</SelectItem>
                  <SelectItem value="smooth">Smooth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleOpenDrawer}>
              Open Side Drawer
            </Button>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Features Demonstrated:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Configurable slide direction (left, right, top, bottom)</li>
                <li>• Configurable transition duration</li>
                <li>• Enhanced smoothness curves (7 options)</li>
                <li>• Configurable width (% or px)</li>
                <li>• Back button navigation</li>
                <li>• Close button and ESC key</li>
                <li>• Outside click to close</li>
                <li>• Scrollable body content</li>
                <li>• Sticky footer with buttons</li>
                <li>• Responsive (full width on mobile)</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="font-medium mb-2">Configuration Options:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Custom title</li>
                <li>• Toggle back/close buttons</li>
                <li>• Configurable footer buttons</li>
                <li>• Custom button variants</li>
                <li>• Outside click behavior</li>
                <li>• Custom transition duration</li>
                <li>• Custom width (percentage or pixels)</li>
                <li>• Slide direction (left, right, top, bottom)</li>
                <li>• Smoothness curves (ease-in-out, ease-in, ease-out, linear, bounce, spring, smooth)</li>
                <li>• Custom styling support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onBack={handleBackStep}
        title={`Contact Form - Step ${currentStep}`}
        showBackButton={true}
        showCloseButton={true}
        showFooter={true}
        footerButtons={getFooterButtons()}
        closeOnOutsideClick={true}
        transitionDuration={transitionDuration}
        width={drawerWidth}
        slideDirection={slideDirection}
        smoothness={smoothness}
      >
        {renderStepContent()}
      </SideDrawer>
    </div>
  );
};

export default SideDrawerDemo;
