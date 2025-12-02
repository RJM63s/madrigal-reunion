import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function FamilyTree() {
  const svgRef = useRef(null);
  const [familyData, setFamilyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highlightedNode, setHighlightedNode] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/family')
      .then(res => res.json())
      .then(data => {
        setFamilyData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching family data:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (familyData.length === 0 || !svgRef.current) return;

    // Clear existing SVG content
    d3.select(svgRef.current).selectAll('*').remove();

    const width = 1400;
    const height = 900;
    const nodeRadius = 60; // Larger nodes

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Create a group for zooming and panning
    const g = svg.append('g');

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create nodes from family data
    const nodes = familyData.map((member, i) => ({
      id: member.id,
      name: member.name,
      photo: member.photo,
      generation: member.generation,
      relationshipType: member.relationshipType,
      connectedThrough: member.connectedThrough,
      familyBranch: member.familyBranch,
      attendees: member.attendees
    }));

    // Create links based on connectedThrough
    const links = [];
    nodes.forEach(node => {
      const parent = nodes.find(n => n.name === node.connectedThrough);
      if (parent) {
        links.push({
          source: parent.id,
          target: node.id
        });
      }
    });

    // Create radial force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links)
        .id(d => d.id)
        .distance(200)
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody()
        .strength(-500)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(nodeRadius + 30))
      .force('radial', d3.forceRadial(
        d => d.generation * 120,
        width / 2,
        height / 2
      ).strength(0.8));

    // Draw links with gradient
    const linkGroup = g.append('g');

    const link = linkGroup.selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'tree-link')
      .attr('stroke', '#d97706')
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.4)
      .style('transition', 'all 0.3s ease');

    // Draw nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'tree-node')
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      );

    // Outer glow circle
    node.append('circle')
      .attr('r', nodeRadius + 8)
      .attr('fill', 'url(#radialGradient)')
      .attr('opacity', 0.3)
      .attr('class', 'node-glow');

    // Main node circle with gradient
    const defs = svg.append('defs');

    const gradient = defs.append('radialGradient')
      .attr('id', 'radialGradient');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#fbbf24');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f59e0b');

    node.append('circle')
      .attr('r', nodeRadius)
      .attr('fill', 'url(#radialGradient)')
      .attr('stroke', '#78350f')
      .attr('stroke-width', 4)
      .style('filter', 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))');

    // Add photos to nodes with circular clip
    node.append('clipPath')
      .attr('id', d => `clip-${d.id}`)
      .append('circle')
      .attr('r', nodeRadius - 8);

    node.append('image')
      .attr('clip-path', d => `url(#clip-${d.id})`)
      .attr('xlink:href', d => d.photo ? `http://localhost:3001${d.photo}` : '')
      .attr('x', -(nodeRadius - 8))
      .attr('y', -(nodeRadius - 8))
      .attr('width', (nodeRadius - 8) * 2)
      .attr('height', (nodeRadius - 8) * 2)
      .attr('preserveAspectRatio', 'xMidYMid slice')
      .on('error', function() {
        d3.select(this).remove();
      });

    // Add decorative flower/sparkle on nodes
    node.append('text')
      .text('✨')
      .attr('x', nodeRadius - 15)
      .attr('y', -nodeRadius + 10)
      .attr('font-size', '20px')
      .attr('class', 'node-decoration');

    // Add name labels with background
    const nameLabel = node.append('g')
      .attr('transform', `translate(0, ${nodeRadius + 15})`);

    nameLabel.append('rect')
      .attr('x', d => -d.name.length * 4)
      .attr('y', -12)
      .attr('width', d => d.name.length * 8)
      .attr('height', 20)
      .attr('fill', 'white')
      .attr('opacity', 0.9)
      .attr('rx', 10);

    nameLabel.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('fill', '#78350f')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .attr('dy', '0.35em');

    // Add generation badges
    node.append('circle')
      .attr('cx', nodeRadius - 15)
      .attr('cy', nodeRadius - 15)
      .attr('r', 18)
      .attr('fill', '#ec4899')
      .attr('stroke', 'white')
      .attr('stroke-width', 2);

    node.append('text')
      .text(d => d.generation)
      .attr('x', nodeRadius - 15)
      .attr('y', nodeRadius - 15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .attr('font-weight', 'bold')
      .attr('font-size', '14px')
      .attr('dy', '0.35em');

    // Add tooltips
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('padding', '12px 16px')
      .style('background', 'linear-gradient(135deg, #fbbf24, #f59e0b)')
      .style('color', 'white')
      .style('border', '3px solid #78350f')
      .style('border-radius', '12px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('font-family', "'Poppins', sans-serif")
      .style('box-shadow', '0 8px 16px rgba(0,0,0,0.3)')
      .style('z-index', 1000);

    // Hover effects
    node.on('mouseover', (event, d) => {
      // Highlight the hovered node
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('transform', 'scale(1.2)');

      // Highlight connected links
      link.attr('stroke-opacity', l => {
        return (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1;
      })
      .attr('stroke-width', l => {
        return (l.source.id === d.id || l.target.id === d.id) ? 6 : 3;
      })
      .attr('stroke', l => {
        return (l.source.id === d.id || l.target.id === d.id) ? '#f59e0b' : '#d97706';
      });

      // Show tooltip
      tooltip.transition().duration(200).style('opacity', 1);
      tooltip.html(`
        <div style="text-align: center;">
          <strong style="font-size: 16px;">${d.name}</strong><br/>
          <div style="margin-top: 8px; font-size: 13px;">
            ${d.relationshipType}<br/>
            Connected Through: ${d.connectedThrough}<br/>
            Generation: ${d.generation}<br/>
            Attendees: ${d.attendees}
          </div>
        </div>
      `)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', (event) => {
      // Reset node
      d3.select(event.currentTarget)
        .transition()
        .duration(200)
        .attr('transform', 'scale(1)');

      // Reset links
      link.transition()
        .duration(300)
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 3)
        .attr('stroke', '#d97706');

      // Hide tooltip
      tooltip.transition().duration(500).style('opacity', 0);
    });

    // Update positions on simulation tick with smooth animation
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Drag functions
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      tooltip.remove();
    };
  }, [familyData]);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="text-3xl text-amber-800 font-bold" style={{fontFamily: "'Dancing Script', cursive"}}>
          ✨ Loading family tree... ✨
        </div>
      </div>
    );
  }

  if (familyData.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-3xl text-amber-800 mb-4 font-bold" style={{fontFamily: "'Dancing Script', cursive"}}>
          🌺 No family members registered yet 🌺
        </div>
        <p className="text-gray-600 text-lg">Be the first to register and start the family tree!</p>
      </div>
    );
  }

  return (
    <div className="festive-card bg-white rounded-2xl shadow-2xl p-8">
      <h2 className="text-4xl font-bold text-amber-900 mb-4 text-center celebration-title" style={{fontFamily: "'Dancing Script', cursive"}}>
        🌸 Madrigal Family Tree 🌸
      </h2>
      <div className="text-center mb-6 text-base text-gray-600 bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
        <p className="font-semibold mb-2">🖱️ Interactive Features:</p>
        <div className="flex justify-center gap-8 text-sm">
          <span>✨ Hover to highlight connections</span>
          <span>🖱️ Drag nodes to rearrange</span>
          <span>🔍 Scroll to zoom</span>
          <span>👆 Pan by dragging</span>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border-4 border-gradient-to-r from-amber-500 via-pink-500 to-purple-500 shadow-inner bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
        <svg ref={svgRef} className="w-full"></svg>
      </div>
      <div className="mt-6 text-center">
        <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
          🌺 Total Family Members: {familyData.length} 🌺
        </div>
      </div>
    </div>
  );
}

export default FamilyTree;
