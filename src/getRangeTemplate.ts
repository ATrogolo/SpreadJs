export const dialogGetRangeTemplate = {
  title: 'Select',
  content: [
    {
      type: 'ColumnSet',
      children: [
        {
          type: 'Column',
          children: [
            {
              type: 'TextBlock',
              text: 'Range:',
            },
          ],
        },
        {
          type: 'Column',
          children: [
            {
              text: 'Range',
              type: 'RangeSelect',
              margin: '0 0 0 10px',
              title: 'Select Range',
              needEqualSign: false,
              absoluteReference: false,
              needSheetName: true,
              isOneRange: true,
              isSingleCell: false,
              bindingPath: 'range',
            },
          ],
        },
      ],
    },
  ],
}
