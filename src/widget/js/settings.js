export default {
  padX: 30, // left and right text box padding
  padY: 6, // top and bottom text box padding
  fontTimeout: 1000, // max time to wait for font to load in ms
  headingOffset: 0.15, // % of heading height to start split text chars from
  overflowSpeed: 100,
  minOverflowDuration: 0.5,
  widgetFlipX: Boolean($_flipX_$),
  widgetFlipY: Boolean($_flipY_$),
  textBoxWidth: Number($_maxTextBoxWidth_$),
  textBoxHeight: Number($_textBoxHeight_$),
  showDuration: Number($_showDuration_$),
  replayWait: Number($_replayWait_$),
  widthAdjust: "$_widthAdjust_$",
  alignment: "$_alignment_$",
  maxImageWidth: Number($_maxImageWidth_$),
  maxImageHeight: Number($_maxImageHeight_$),
  headingFont: "$_headingFont_$",
  subheadingFont: "$_subheadingFont_$",
  numPanels: Number($_numPanels_$),
  numMegaPanels: Number($_numMegaPanels_$),
  panels: [
    {
      id: "panel1",
      heading: "$_panel1_heading_$",
      subheading: "$_panel1_subheading_$",
      icon: "$_panel1_icon_$"
    },
    {
      id: "panel2",
      heading: "$_panel2_heading_$",
      subheading: "$_panel2_subheading_$",
      icon: "$_panel2_icon_$"
    },
    {
      id: "panel3",
      heading: "$_panel3_heading_$",
      subheading: "$_panel3_subheading_$",
      icon: "$_panel3_icon_$"
    },
    {
      id: "panel4",
      heading: "$_panel4_heading_$",
      subheading: "$_panel4_subheading_$",
      icon: "$_panel4_icon_$"
    },
    {
      id: "panel5",
      heading: "$_panel5_heading_$",
      subheading: "$_panel5_subheading_$",
      icon: "$_panel5_icon_$"
    }
  ],
  megaPanels: [
    {
      id: "megaPanel1",
      heading: "$_megaPanel1_heading_$",
      subheading: "$_megaPanel1_subheading_$",
      icon: "$_megaPanel1_icon_$",
      image: "$_megaPanel1_image_$",
      video: "$_megaPanel1_video_$"
    },
    {
      id: "megaPanel2",
      heading: "$_megaPanel2_heading_$",
      subheading: "$_megaPanel2_subheading_$",
      icon: "$_megaPanel2_icon_$",
      image: "$_megaPanel2_image_$",
      video: "$_megaPanel2_video_$"
    }
  ]
};
